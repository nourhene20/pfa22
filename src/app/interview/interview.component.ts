import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class InterviewComponent implements OnInit, AfterViewInit {
  questions: string[] = [];
  currentQuestionIndex: number = 0;
  synth: SpeechSynthesis | null = null;
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
  @ViewChild('messagesContainer') messagesDivRef!: ElementRef<HTMLElement>;
  messagesDiv: HTMLElement | null = null;
  startInterviewButton: HTMLButtonElement | null = null;

  domaine: string = '';

  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.startInterviewButton = document.getElementById('startInterview') as HTMLButtonElement | null;
    }

    this.route.paramMap.subscribe(params => {
      this.domaine = params.get('domaine') || '';
      if (this.domaine) {
        this.loadQuestions(this.domaine);
      } else {
        this.questions = ['Question de test : Quels sont vos points forts ?'];
        if (this.startInterviewButton) {
          this.startInterviewButton.disabled = false;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.messagesDiv = this.messagesDivRef?.nativeElement;
  }

  loadQuestions(domaine: string): void {
    fetch(`http://localhost:5000/entretien/domaines/${encodeURIComponent(domaine)}`)
      .then(response => response.json())
      .then(data => {
        this.questions = data.questions
          ? data.questions.split('\n').filter((q: string) => q.trim() !== '')
          : ['Question de test : Quels sont vos points forts ?'];
      })
      .catch(() => {
        this.questions = ['Question de test : Quels sont vos points forts ?'];
      });
  }

  async startInterview(): Promise<void> {
    try {
      if (this.startInterviewButton) {
        this.startInterviewButton.disabled = true;
      }
      this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.videoPreview?.nativeElement) {
        this.videoPreview.nativeElement.srcObject = this.videoStream;
        this.videoPreview.nativeElement.play();
      }

      this.initializeMediaRecorder();
      this.initializeSpeechRecognition();
      this.askQuestion();
    } catch (error) {
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
        }
      };
      this.mediaRecorder.start(1000);
    }
  }

  initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognizer = new (window as any).webkitSpeechRecognition();
      this.recognizer.continuous = true;
      this.recognizer.interimResults = true;
      this.recognizer.lang = 'fr-FR';

      this.recognizer.onresult = (e: any) => {
        const result = e.results[e.results.length - 1];
        if (!result.isFinal) {
          if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
            this.startSpeechTimeout();
          }
          this.resetSpeechTimeout();
        } else {
          this.handleResponse(result[0].transcript);
          this.isUserSpeaking = false;
          this.isRecognitionActive = false;
        }
      };

      this.recognizer.onend = () => {
        this.isRecognitionActive = false;
      };

      this.recognizer.onerror = (e: any) => {
        this.isRecognitionActive = false;
        if (e.error === 'no-speech') {
          this.recognizer.start();
          this.isRecognitionActive = true;
        } else if (e.error === 'audio-capture') {
          this.displayMessage('Erreur : aucun microphone détecté.', 'system');
        }
      };
    } else {
      this.displayMessage('Reconnaissance vocale non supportée, utilisez Chrome.', 'system');
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
    this.saveResponse(this.questions[this.currentQuestionIndex], response);
    this.displayMessage(response, 'user');
    this.nextQuestion();
  }

  askQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endInterview();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    this.displayMessage(question, 'bot');

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'fr-FR';

    const voices = this.synth?.getVoices();
    const voice = voices?.find(v => v.lang === 'fr-FR');
    if (voice) utterance.voice = voice;

    this.synth?.cancel();
    this.synth?.speak(utterance);

    utterance.onend = () => {
      this.displayMessage('Parlez maintenant...', 'system');
      if (this.recognizer && !this.isRecognitionActive) {
        this.recognizer.start();
        this.isRecognitionActive = true;
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
      this.endInterview();
    }
  }

  endInterview(): void {
    if (this.mediaRecorder) this.mediaRecorder.stop();
    if (this.recognizer) this.recognizer.stop();

    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length > 0) {
          const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
          this.generateVideoFile(videoBlob);
          this.sendVideoToServer(videoBlob);
          this.cleanupResources();
        } else {
          this.displayMessage('Erreur : aucun enregistrement vidéo.', 'system');
          this.cleanupResources();
        }
      };
    }

    this.generateResponseFile();
  }

  cleanupResources(): void {
    this.videoStream?.getTracks().forEach(t => t.stop());
    this.audioStream?.getTracks().forEach(t => t.stop());
    if (this.startInterviewButton) this.startInterviewButton.disabled = false;
  }

  saveResponse(question: string, response: string): void {
    const storedResponses = localStorage.getItem('responses') || '';
    const newResponse = `Question: ${question}\nRéponse: ${response}\n\n`;
    localStorage.setItem('responses', storedResponses + newResponse);
  }

  displayMessage(text: string, sender: string): void {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ text, sender, timestamp });

    if (this.messagesDiv) {
      const messageDiv = this.renderer.createElement('div');
      this.renderer.addClass(messageDiv, 'message');
      this.renderer.addClass(messageDiv, sender);
      const messageText = this.renderer.createText(`[${timestamp}] ${text}`);
      this.renderer.appendChild(messageDiv, messageText);
      this.renderer.appendChild(this.messagesDiv, messageDiv);
      this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
  }

  sendVideoToServer(videoBlob: Blob): void {
    const formData = new FormData();
    formData.append('video', videoBlob, 'interview.webm');

    fetch('/upload-video', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => console.log('Vidéo envoyée :', data))
      .catch(err => console.error('Erreur d\'envoi vidéo :', err));
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
  }

  generateVideoFile(videoBlob: Blob): void {
    if (!videoBlob || videoBlob.size === 0) {
      this.displayMessage('Erreur : impossible de générer le fichier vidéo.', 'system');
      return;
    }

    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entretien_${new Date().toISOString()}.mp4`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
