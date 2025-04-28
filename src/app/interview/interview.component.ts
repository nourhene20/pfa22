
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
  imports: [CommonModule]
})
export class InterviewComponent implements OnInit, AfterViewInit {
  questions: string[] = [];
  currentQuestionIndex: number = 0;
  synth = window.speechSynthesis;
  recognizer: any;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  videoStream: MediaStream | null = null;
  audioStream: MediaStream | null = null;
  isUserSpeaking: boolean = false;
  isRecognitionActive: boolean = false;
  speechTimeout: any;
  SPEECH_TIMEOUT: number = 10000;

  messages: { text: string, sender: string, timestamp: string }[] = [];

  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('messages') messagesDivRef!: ElementRef<HTMLElement>;
  messagesDiv: HTMLElement | null = null;
  startInterviewButton: HTMLButtonElement | null = null;

  domaine: string = '';

  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.domaine = params.get('domaine') || ''; });
    this.startInterviewButton = document.getElementById('startInterview') as HTMLButtonElement | null;

    this.route.paramMap.subscribe(params => {
      this.domaine = params.get('domaine') || '';
      console.log('Domaine extrait de l\'URL :', this.domaine);

      if (this.domaine) {
        this.loadQuestions(this.domaine);
      } else {
        console.error('Aucun domaine trouvé dans l\'URL');
        this.questions = ['Question de test : Quels sont vos points forts ?'];
        if (this.startInterviewButton) {
          this.startInterviewButton.disabled = false;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.messagesDiv = this.messagesDivRef?.nativeElement || document.getElementById('messages');
    console.log('Messages div initialized:', this.messagesDiv);
    if (!this.messagesDiv) {
      console.error('Failed to initialize messagesDiv: #messages not found in DOM');
    }
  }

  loadQuestions(domaine: string): void {
    console.log('Fetching questions for domaine:', domaine);
    fetch(`http://localhost:5000/entretien/domaines/${encodeURIComponent(domaine)}`)
      .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetch data:', data);
        this.questions = data.questions
          ? data.questions.split('\n').filter((q: string) => q.trim() !== '')
          : [];
        console.log('Questions chargées :', this.questions);
        if (this.questions.length === 0) {
          console.warn('No questions loaded, using fallback');
          this.questions = ['Question de test : Quels sont vos points forts ?'];
        }
        if (this.startInterviewButton) {
          this.startInterviewButton.disabled = !this.questions.length;
        }
      })
      .catch(error => {
        console.error('Erreur de chargement des questions:', error);
        this.questions = ['Question de test : Quels sont vos points forts ?'];
        if (this.startInterviewButton) {
          this.startInterviewButton.disabled = false;
        }
      });
  }

  async startInterview(): Promise<void> {
    console.log('Starting interview...');
    try {
      if (this.startInterviewButton) {
        this.startInterviewButton.disabled = true;
      }
      this.videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      if (this.videoPreview && this.videoPreview.nativeElement) {
        this.videoPreview.nativeElement.srcObject = this.videoStream;
        this.videoPreview.nativeElement.play();
        console.log('Camera started, video preview set');
      }
      this.initializeMediaRecorder();
      this.initializeSpeechRecognition();
      this.askQuestion();
    } catch (error) {
      console.error('Erreur d\'accès à la caméra/micro :', error);
      alert('Autorisez l\'accès à la caméra et au micro !');
      if (this.startInterviewButton) {
        this.startInterviewButton.disabled = false;
      }
    }
  }

  initializeMediaRecorder(): void {
    if (this.videoStream) {
      const combinedStream = new MediaStream([
        ...this.videoStream.getVideoTracks(),
        ...(this.audioStream ? this.audioStream.getAudioTracks() : [])
      ]);
      this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
          console.log('Recorded chunk added, size:', e.data.size);
        }
      };
      this.mediaRecorder.start(1000); // Record in 1-second chunks
      console.log('MediaRecorder initialized and started');
    }
  }

  initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognizer = new (window as any).webkitSpeechRecognition();
      this.recognizer.continuous = true;
      this.recognizer.interimResults = true;
      this.recognizer.lang = 'fr-FR';

      this.recognizer.onresult = (e: any) => {
        console.log('Speech recognition result received');
        const result = e.results[e.results.length - 1];
        if (!result.isFinal) {
          if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
            this.startSpeechTimeout();
            console.log('User started speaking');
          }
          this.resetSpeechTimeout();
        } else {
          console.log('Final response detected:', result[0].transcript);
          this.handleResponse(result[0].transcript);
          this.isUserSpeaking = false;
          this.isRecognitionActive = false;
        }
      };

      this.recognizer.onend = () => {
        console.log('Speech recognition ended');
        this.isRecognitionActive = false;
      };

      this.recognizer.onerror = (e: any) => {
        console.error('Speech recognition error:', e.error);
        this.isRecognitionActive = false;
        if (e.error === 'no-speech' && !this.isRecognitionActive) {
          console.log('No speech detected, restarting recognition');
          this.recognizer.start();
          this.isRecognitionActive = true;
        } else if (e.error === 'audio-capture') {
          console.error('Aucun microphone trouvé');
          this.displayMessage('Erreur : aucun microphone détecté.', 'system');
        }
      };
      console.log('SpeechRecognition initialized');
    } else {
      console.error('La reconnaissance vocale n\'est pas supportée dans ce navigateur.');
      this.displayMessage('Reconnaissance vocale non supportée, veuillez utiliser Chrome.', 'system');
    }
  }

  startSpeechTimeout(): void {
    clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      if (this.isUserSpeaking) {
        this.displayMessage('Silence détecté, question suivante...', 'bot');
        this.nextQuestion();
      }
    }, this.SPEECH_TIMEOUT);
  }

  resetSpeechTimeout(): void {
    clearTimeout(this.speechTimeout);
    this.startSpeechTimeout();
  }

  handleResponse(response: string): void {
    console.log('Handling response:', response);
    this.saveResponse(this.questions[this.currentQuestionIndex], response);
    this.displayMessage(response, 'user');
    this.nextQuestion();
  }

  askQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      console.warn('No more questions available');
      this.endInterview();
      return;
    }
    console.log('Asking question:', this.questions[this.currentQuestionIndex]);
    this.isUserSpeaking = false;
    const question = this.questions[this.currentQuestionIndex];
    this.displayMessage(question, 'bot');

    const cleanQuestion = question.trim();
    const utterance = new SpeechSynthesisUtterance(cleanQuestion);
    utterance.lang = 'fr-FR';

    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.lang === 'fr-FR');
    if (voice) {
      utterance.voice = voice;
    }

    this.synth.cancel();
    this.synth.speak(utterance);
    console.log('Question being spoken:', cleanQuestion);

    utterance.onend = () => {
      console.log('Question speech ended, prompting user to speak');
      this.displayMessage('Parlez maintenant...', 'system');
      if (this.recognizer && !this.isRecognitionActive) {
        this.recognizer.start();
        this.isRecognitionActive = true;
        console.log('Speech recognition started');
      } else {
        console.error('Recognizer not initialized or already active');
        this.displayMessage('Erreur : reconnaissance vocale non disponible.', 'system');
      }
    };
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;
    this.isUserSpeaking = false;
    clearTimeout(this.speechTimeout);

    if (this.currentQuestionIndex < this.questions.length) {
      this.askQuestion();
    } else {
      console.log('All questions asked, ending interview');
      this.endInterview();
    }
  }

  endInterview(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      console.log('MediaRecorder stopped');
    }
    if (this.recognizer) {
      this.recognizer.stop();
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = () => {
        console.log('MediaRecorder onstop triggered');
        if (this.recordedChunks.length > 0) {
          const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
          this.generateVideoFile(videoBlob); // Generate and download video file
          this.sendVideoToServer(videoBlob); // Optionally send to server
          this.cleanupResources();
        } else {
          console.error('No recorded chunks available');
          this.displayMessage('Erreur : aucun enregistrement vidéo disponible.', 'system');
          this.cleanupResources();
        }
      };
    }
    this.generateResponseFile();
    console.log('Interview ended');
  }

  cleanupResources(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    if (this.startInterviewButton) {
      this.startInterviewButton.disabled = false;
    }
    console.log('Resources cleaned up');
  }

  saveResponse(question: string, response: string): void {
    const storedResponses = localStorage.getItem('responses') || '';
    const newResponse = `Question: ${question}\nRéponse: ${response}\n\n`;
    localStorage.setItem('responses', storedResponses + newResponse);
    console.log('Response saved:', response);
  }

  displayMessage(text: string, sender: string): void {
    console.log(`Attempting to display message: [${sender}] ${text}`);
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ text, sender, timestamp });
    console.log(`Message added to messages array: [${sender}] ${text}`);

    if (this.messagesDiv) {
      const messageDiv = this.renderer.createElement('div');
      this.renderer.addClass(messageDiv, 'message');
      this.renderer.addClass(messageDiv, sender);
      const messageText = this.renderer.createText(`[${timestamp}] ${text}`);
      this.renderer.appendChild(messageDiv, messageText);
      this.renderer.appendChild(this.messagesDiv, messageDiv);
      this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
      console.log(`Message appended to DOM: [${sender}] ${text}`);
    } else {
      console.error('Messages div is null, cannot append to DOM');
    }
  }

  sendVideoToServer(videoBlob: Blob): void {
    const formData = new FormData();
    formData.append('video', videoBlob, 'interview.webm');

    fetch('/upload-video', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Vidéo envoyée avec succès :', data);
      })
      .catch(error => {
        console.error('Erreur lors de l\'envoi de la vidéo :', error);
      });
  }

  generateResponseFile(): void {
    const responses = localStorage.getItem('responses') || '';
    if (!responses.trim()) {
      alert('Aucune réponse à sauvegarder.');
      return;
    }

    const blob = new Blob([responses], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reponses_entretien_${new Date().toISOString()}.txt`;
    link.click();
    console.log('Response file generated');
  }

  generateVideoFile(videoBlob: Blob): void {
    if (!videoBlob || videoBlob.size === 0) {
      console.error('Video blob is empty or invalid');
      this.displayMessage('Erreur : impossible de générer le fichier vidéo.', 'system');
      return;
    }

    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entretien_${new Date().toISOString()}.mp4`; // Using .mp4 extension
    link.click();
    URL.revokeObjectURL(url);
    console.log('Video file generated and downloaded');
  }
}