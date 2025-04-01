// Add styles for the BibTeX modal
function addBibtexStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .bibtex-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
            justify-content: center;
            align-items: center;
        }
        
        .bibtex-modal-content {
            background-color: #fefefe;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 700px;
            position: relative;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .close-bibtex {
            color: #aaa;
            position: absolute;
            right: 15px;
            top: 10px;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .bibtex-title {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .bibtex-content {
            background-color: #f8f9fa;
            padding: 10px;
            overflow-x: auto;
            white-space: pre-wrap;
            font-size: 13px;
            line-height: 1.4;
            border-radius: 4px;
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(styleElement);
}

// Create and insert the modal HTML
function createBibtexModal() {
    const modalHTML = `
        <div id="bibtexModal" class="bibtex-modal">
            <div class="bibtex-modal-content">
                <span id="closeBibtex" class="close-bibtex">&times;</span>
                <h3 class="bibtex-title">BibTeX</h3>
                <pre id="bibtexContent" class="bibtex-content"></pre>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close the modal
function closeBibtexModal() {
    const bibtexModal = document.getElementById('bibtexModal');
    if (bibtexModal) {
        bibtexModal.style.display = 'none';
    }
}

// Set up modal event listeners
function setupBibtexModalEvents() {
    const bibtexModal = document.getElementById('bibtexModal');
    const closeBibtex = document.getElementById('closeBibtex');
    
    // Close modal when clicking on X
    closeBibtex.addEventListener('click', function() {
        closeBibtexModal();
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === bibtexModal) {
            closeBibtexModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && bibtexModal.style.display === 'flex') {
            closeBibtexModal();
            event.preventDefault(); // Prevent default escape key behavior
        }
    });
}

// Show the modal
function showBibtexModal() {
    const bibtexModal = document.getElementById('bibtexModal');
    bibtexModal.style.display = 'flex';
}

// Initialize the BibTeX modal functionality
function initBibtexModal() {
    // Create modal elements first
    addBibtexStyles();
    createBibtexModal();
    setupBibtexModalEvents();
    
    // Function to fetch and show BibTeX
    window.showBibtex = function(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                const bibtexContent = document.getElementById('bibtexContent');
                if (bibtexContent) {
                    bibtexContent.textContent = data;
                    showBibtexModal();
                } else {
                    console.error('BibTeX content element not found');
                    alert('Error: Could not find the BibTeX content element');
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                alert('Failed to load BibTeX: ' + error.message);
            });
    };
}

// Make sure everything is initialized before use
if (document.readyState === 'loading') {
    // Document still loading, add event listener
    document.addEventListener('DOMContentLoaded', initBibtexModal);
} else {
    // Document already loaded, run the function now
    initBibtexModal();
} 