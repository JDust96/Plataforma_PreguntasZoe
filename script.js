document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
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

    // --- ESTADO INICIAL DE LA APLICACIÓN ---
    let isAdmin = false;
    let questions = [
        // Datos de ejemplo para empezar
        { id: 1, text: '¿Cuál es el deadline para el proyecto del primer trimestre?', resolved: true },
        { id: 2, text: '¿Habrá reunión de equipo esta semana?', resolved: false },
        { id: 3, text: '¿Podemos tener un día de trabajo remoto adicional al mes?', resolved: false },
    ];

    // --- FUNCIONES ---

   /**
 * Renderiza (dibuja) la lista de preguntas en la página.
 * @param {Array} questionsToRender - El array de preguntas a mostrar.
 */
const renderQuestions = (questionsToRender = questions) => {
    questionsContainer.innerHTML = ''; // Limpiar el contenedor

    if (questionsToRender.length === 0) {
        noQuestionsMessage.classList.remove('hidden');
    } else {
        noQuestionsMessage.classList.add('hidden');
        questionsToRender.forEach(q => {
            const card = document.createElement('div');
            card.className = `question-card ${q.resolved ? 'resolved' : ''}`;
            card.dataset.id = q.id;

            // --- HTML ACTUALIZADO AQUÍ ---
            card.innerHTML = `
                <p>${q.text}</p>
                <div class="question-footer">
                    <div class="status-tags">
                        ${q.resolved ? '<span class="status-badge resolved">Resuelta</span>' : ''}
                    </div>
                    <div class="admin-buttons">
                        <button class="resolve-btn">${q.resolved ? 'No Resuelta' : 'Resuelta'}</button>
                        <button class="delete-btn">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
            questionsContainer.appendChild(card);
        });
    }
};
    /**
 * Elimina una pregunta del estado y pide confirmación.
 * @param {number} id - El ID de la pregunta a eliminar.
 */
const deleteQuestion = (id) => {
    // Pedimos confirmación antes de una acción destructiva
    const isConfirmed = confirm('¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.');
    
    if (isConfirmed) {
        questions = questions.filter(q => q.id !== id);
        filterQuestions(); // Volvemos a renderizar la lista actualizada
    }
};
    /**
     * Filtra las preguntas basándose en un término de búsqueda.
     */
    const filterQuestions = () => {
        const searchTerm = searchBox.value.toLowerCase();
        const filteredQuestions = questions.filter(q => q.text.toLowerCase().includes(searchTerm));
        renderQuestions(filteredQuestions);
    };

    /**
     * Añade una nueva pregunta al estado y actualiza la UI.
     * @param {string} text - El texto de la nueva pregunta.
     */
    const addQuestion = (text) => {
        const newQuestion = {
            id: Date.now(), // ID único basado en la fecha actual
            text: text,
            resolved: false
        };
        questions.unshift(newQuestion); // Añadir al principio del array
        filterQuestions(); // Volver a renderizar con el filtro actual
    };
    
    /**
     * Cambia el estado 'resolved' de una pregunta.
     * @param {number} id - El ID de la pregunta a modificar.
     */
    const toggleResolve = (id) => {
        const question = questions.find(q => q.id === id);
        if (question) {
            question.resolved = !question.resolved;
            filterQuestions();
        }
    };

    // --- EVENT LISTENERS ---

    // Abrir el modal para hacer una pregunta
    askQuestionBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        questionText.focus();
    });

    // Cerrar el modal
    const closeModal = () => modal.classList.add('hidden');
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Enviar el formulario de nueva pregunta
    questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = questionText.value.trim();
        if (text) {
            addQuestion(text);
            questionForm.reset();
            closeModal();
        }
    });

    // Activar/desactivar el modo administrador
    // --- CÓDIGO ACTUALIZADO CON CONTRASEÑA ---

// Activar/desactivar el modo administrador CON CONTRASEÑA
adminToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const ADMIN_PASSWORD = '28febzoe';

    // Si ya es administrador, simplemente salimos del modo.
    if (isAdmin) {
        isAdmin = false;
        body.classList.remove('admin-mode');
        adminToggle.textContent = 'Acceso Admin';
        alert('Has salido del modo administrador.');
    } 
    // Si no es administrador, pedimos la contraseña.
    else {
        const enteredPassword = prompt('Por favor, ingresa la contraseña de administrador:');

        // Si el usuario presiona "Cancelar", no hacemos nada.
        if (enteredPassword === null) {
            return;
        }

        // Comprobamos si la contraseña es correcta.
        if (enteredPassword === ADMIN_PASSWORD) {
            isAdmin = true;
            body.classList.add('admin-mode');
            adminToggle.textContent = 'Salir del modo Admin';
            alert('Acceso de administrador concedido.');
        } else {
            alert('Contraseña incorrecta. Inténtalo de nuevo.');
        }
    }
});
    
    // Marcar una pregunta como resuelta o eliminarla (usando delegación de eventos)
questionsContainer.addEventListener('click', (e) => {
    if (!isAdmin) return; // Si no es admin, no hacer nada

    const resolveBtn = e.target.closest('.resolve-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (resolveBtn) {
        const card = resolveBtn.closest('.question-card');
        const id = parseInt(card.dataset.id);
        toggleResolve(id);
    }
    
    if (deleteBtn) {
        const card = deleteBtn.closest('.question-card');
        const id = parseInt(card.dataset.id);
        deleteQuestion(id);
    }
});
    
    // Escuchar cambios en la barra de búsqueda
    searchBox.addEventListener('input', filterQuestions);

    // --- INICIALIZACIÓN ---
    renderQuestions();
});