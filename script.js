import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyASK3qJlW9qRYWWT3I0kRFer_-20mCW08k",
    authDomain: "pregrespzoe.firebaseapp.com",
    projectId: "pregrespzoe",
    storageBucket: "pregrespzoe.appspot.com",
    messagingSenderId: "680696631813",
    appId: "1:680696631813:web:2855259d7fc79e52d3426c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questionsContainer = document.getElementById('questions-container');
const noQuestionsMessage = document.getElementById('no-questions-message');
const askQuestionBtn = document.getElementById('ask-question-btn');
const modal = document.getElementById('question-modal');
const closeModalBtn = document.querySelector('.close-modal');
const questionForm = document.getElementById('question-form');
const questionText = document.getElementById('question-text');
const adminToggle = document.getElementById('admin-toggle');
const searchBox = document.getElementById('search-box');
const body = document.body;

let isAdmin = false;
let allQuestions = [];

const renderQuestions = (questionsToRender) => {
    const searchTerm = searchBox.value.toLowerCase();
    const filteredQuestions = questionsToRender.filter(q => q.text.toLowerCase().includes(searchTerm));

    questionsContainer.innerHTML = '';
    noQuestionsMessage.classList.toggle('hidden', filteredQuestions.length === 0);

    filteredQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = `question-card ${q.resolved ? 'resolved' : ''}`;
        card.dataset.id = q.id;
        card.innerHTML = `
            <p>${q.text}</p>
            <div class="question-footer">
                <div class="status-tags">
                    ${q.resolved ? '<span class="status-badge resolved">Resuelta</span>' : ''}
                </div>
                <div class="admin-buttons">
                    <button class="resolve-btn">${q.resolved ? 'No Resuelta' : 'Resuelta'}</button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
        questionsContainer.appendChild(card);
    });
};

const openModal = () => {
    modal.classList.remove('hidden');
    questionText.focus();
};

const closeModal = () => {
    modal.classList.add('hidden');
};

const toggleAdminMode = (e) => {
    e.preventDefault();
    const ADMIN_PASSWORD = '28febzoe';
    if (isAdmin) {
        isAdmin = false;
        body.classList.remove('admin-mode');
        adminToggle.textContent = 'Acceso Admin';
    } else {
        const enteredPassword = prompt('Ingresa la contraseña de administrador:');
        if (enteredPassword === ADMIN_PASSWORD) {
            isAdmin = true;
            body.classList.add('admin-mode');
            adminToggle.textContent = 'Salir del modo Admin';
        } else if (enteredPassword !== null) {
            alert('Contraseña incorrecta.');
        }
    }
};

const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    allQuestions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    renderQuestions(allQuestions);
});

const addQuestion = async (e) => {
    e.preventDefault();
    const text = questionText.value.trim();
    if (text) {
        try {
            await addDoc(collection(db, 'questions'), {
                text: text,
                resolved: false,
                timestamp: serverTimestamp()
            });
            questionForm.reset();
            closeModal();
        } catch (error) {
            console.error("Error al añadir la pregunta: ", error);
            alert("Hubo un error al enviar tu pregunta.");
        }
    }
};

const handleAdminActions = async (e) => {
    if (!isAdmin) return;
    const card = e.target.closest('.question-card');
    if (!card) return;

    const id = card.dataset.id;
    const questionRef = doc(db, 'questions', id);
    const isResolved = card.classList.contains('resolved');

    if (e.target.closest('.resolve-btn')) {
        await updateDoc(questionRef, { resolved: !isResolved });
    }
    
    if (e.target.closest('.delete-btn')) {
        if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
            await deleteDoc(questionRef);
        }
    }
};

questionForm.addEventListener('submit', addQuestion);
questionsContainer.addEventListener('click', handleAdminActions);
searchBox.addEventListener('input', () => renderQuestions(allQuestions));
askQuestionBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
adminToggle.addEventListener('click', toggleAdminMode);