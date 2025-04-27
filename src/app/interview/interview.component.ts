import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss']
})
export class InterviewComponent implements OnInit {
  questions: string[] = [];
  currentQuestionIndex: number = 0;
  synth = window.speechSynthesis;
  recognizer: any;
  mediaRecorder: MediaRecorder;
  recordedChunks: Blob[] = [];
  userStream: MediaStream | null = null;
  isUserSpeaking: boolean = false;
  speechTimeout: any;
  SPEECH_TIMEOUT: number = 10000; // 10 secondes de silence après parole

  // Références DOM
  messagesDiv: HTMLElement | null;
  startInterviewButton: HTMLButtonElement | null;
  videoPreview: HTMLVideoElement | null;

  domaine: string = '';  // Variable pour stocker le domaine récupéré depuis l'URL

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.messagesDiv = document.getElementById('messages') as HTMLElement | null;
    this.startInterviewButton = document.getElementById('startInterview') as HTMLButtonElement | null;
    this.videoPreview = document.getElementById('videoPreview') as HTMLVideoElement | null;

    // Récupérer le domaine depuis l'URL
    this.route.paramMap.subscribe(params => {
      this.domaine = params.get('domaine') || '';
      console.log('Domaine extrait de l\'URL :', this.domaine);

      if (this.domaine) {
        this.loadQuestions(this.domaine);
      } else {
        console.error('Aucun domaine trouvé dans l\'URL');
      }
    });
  }

  loadQuestions(domaine: string): void {
    fetch(`http://localhost:5000/entretien/domaines/${domaine}`)
      .then(response => response.json()) 
      .then(data => {
        this.questions = data.questions
          ? data.questions.split('\n').filter((q: string) => q.trim() !== '')
          : [];
        console.log("Questions chargées : ", this.questions);
        if (this.startInterviewButton) {
          this.startInterviewButton.disabled = !this.questions.length;
        }
      })
      .catch(error => {
        console.error('Erreur de chargement des questions:', error);
      });
  }
  async startInterview(): Promise<void> {
    try {
      if (this.startInterviewButton) {
        this.startInterviewButton.disabled = true;
      }

      this.userStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      if (this.videoPreview) {
        this.videoPreview.srcObject = this.userStream;
      }

      this.initializeMediaRecorder();
      this.initializeSpeechRecognition();

      this.currentQuestionIndex = 0;
      this.askQuestion();
      
    } catch (error) {
      alert('Autorisez l\'accès à la caméra et au micro !');
      if (this.startInterviewButton) {
        this.startInterviewButton.disabled = false;
      }
    }
  }

  initializeMediaRecorder(): void {
    this.mediaRecorder = new MediaRecorder(this.userStream as MediaStream, { mimeType: 'video/webm' });
    this.mediaRecorder.ondataavailable = (e: any) => this.recordedChunks.push(e.data);
    this.mediaRecorder.start();
  }

  initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognizer = new (window as any).webkitSpeechRecognition();
      this.recognizer.continuous = true;
      this.recognizer.interimResults = true;
      this.recognizer.lang = 'fr-FR';

      let isRecognizing = false;

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
        }
      };

      this.recognizer.onerror = (e: any) => {
        console.error('Erreur reconnaissance:', e.error);
        if (e.error === 'no-speech' && !isRecognizing) {
          this.recognizer.start();
          isRecognizing = true;
        }
        else if (e.error === 'audio-capture') {
          console.error("Aucun microphone trouvé");
        } else {
          this.recognizer.start();
        }
      };
    } else {
      console.error("La reconnaissance vocale n'est pas supportée dans ce navigateur.");
    }
  }

  startSpeechTimeout(): void {
    clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      if (this.isUserSpeaking) {
        this.displayMessage("Silence détecté, question suivante...", 'bot');
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
    this.isUserSpeaking = false;
    
    // Récupérer la question actuelle
    const question = this.questions[this.currentQuestionIndex];
    this.displayMessage(question, 'bot');
    
    // Nettoyer le texte de la question avant de le lire
    const cleanQuestion = question.trim();  // Supprime les espaces avant et après
    const utterance = new SpeechSynthesisUtterance(cleanQuestion);
    utterance.lang = 'fr-FR';
    
    // Optionnel : définir la voix (par défaut la voix en français)
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.lang === 'fr-FR');
    if (voice) {
      utterance.voice = voice;
    }
  
    // Lire la question en entier
    this.synth.cancel();  // Annule toute synthèse vocale précédente
    this.synth.speak(utterance);
    
    // Lorsqu'une question est lue en entier, démarrer la reconnaissance vocale
    utterance.onend = () => {
      this.displayMessage("Parlez maintenant...", 'system');
      this.recognizer.start();  // Démarrer la reconnaissance vocale après la lecture
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
    this.mediaRecorder.stop();
    this.recognizer.stop();
    
    this.mediaRecorder.onstop = () => {
      const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.sendVideoToServer(videoBlob);
      this.cleanupResources();
    };
     this.generateResponseFile();
  }

  cleanupResources(): void {
    if (this.userStream) {
      this.userStream.getTracks().forEach(track => track.stop());
    }
    if (this.startInterviewButton) {
      this.startInterviewButton.disabled = false;
    }
  }

  saveResponse(question: string, response: string): void {
    const storedResponses = localStorage.getItem('responses') || ''; // Récupérer les réponses précédentes
    const newResponse = `Question: ${question}\nRéponse: ${response}\n\n`; // Format question-réponse
    localStorage.setItem('responses', storedResponses + newResponse); // Sauvegarder dans localStorage
}


displayMessage(text: string, sender: string): void {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;

  // Assurez-vous que #messages est bien récupéré
  const messagesDiv = document.getElementById('messages');
  if (messagesDiv) {
    messagesDiv.appendChild(messageDiv);
    // Pour faire défiler vers le bas au fur et à mesure que les messages sont ajoutés
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}
  sendVideoToServer(videoBlob: Blob): void {
    const formData = new FormData();
    formData.append('video', videoBlob, 'interview.webm');

    fetch('/upload-video', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Vidéo envoyée avec succès :', data);
      })
      .catch((error) => {
        console.error('Erreur lors de l\'envoi de la vidéo :', error);
      });
  } 
  generateResponseFile(): void {
    const responses = localStorage.getItem('responses') || '';
    
    // Si aucune réponse n'est enregistrée, ne rien faire
    if (!responses.trim()) {
      alert("Aucune réponse à sauvegarder.");
      return;
    }
  
    // Créer un blob contenant les réponses
    const blob = new Blob([responses], { type: 'text/plain;charset=utf-8' });
  
    // Utiliser FileSaver.js pour sauvegarder le fichier
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reponses_entretien_${new Date().toISOString()}.txt`;  // Nom du fichier avec la date
    link.click();  // Simuler un clic pour télécharger le fichier
  }
  
}

