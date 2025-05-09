document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    const progressBar = document.getElementById('progressBar');

    // Hide content initially
    content.style.display = 'none';

    // Simulate loading with progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 2;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progress >= 100) {
            clearInterval(loadingInterval);
            // Hide loader and show content
            setTimeout(() => {
                loader.style.opacity = '0';
                content.style.display = 'block';
                // Trigger reflow
                void content.offsetWidth;
                content.classList.add('show-content');
                
                // Remove loader from DOM after fade
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 300);
        }
    }, 30); // Adjust timing here - currently takes ~1.5 seconds to load

    // Fallback: force hide loader if it takes too long
    setTimeout(() => {
        if (loader.style.display !== 'none') {
            loader.style.display = 'none';
            content.style.display = 'block';
            content.classList.add('show-content');
        }
    }, 5000); // 5 second timeout

    // Tab navigation
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");

            // Update tabs
            tabs.forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            // Update content
            tabContents.forEach((content) => {
                content.classList.remove("active");
            });
            document.getElementById(target).classList.add("active");

            // Save current tab to localStorage
            localStorage.setItem("currentTab", target);

            // Add small delay to ensure DOM updates
            setTimeout(scrollActiveTabIntoView, 100);
        });
    });

    // Restore previous tab if available
    const savedTab = localStorage.getItem("currentTab");
    if (savedTab) {
        const tabToActivate = document.querySelector(
            `.tab[data-tab="${savedTab}"]`
        );
        if (tabToActivate) {
            tabToActivate.click();
        }
    }

    // Audio player functionality
    const playButton = document.getElementById("playButton");
    const playIcon = document.getElementById("playIcon");
    const audioProgress = document.getElementById("audioProgress");
    const audioProgressBar = document.getElementById("audioProgressBar");
    const audioTime = document.getElementById("audioTime");

    // Create an audio element
    const audio = new Audio("https://example.com/sunday-school-lesson.mp3"); // Replace with actual audio file
    let isPlaying = false;

    playButton.addEventListener("click", () => {
        if (isPlaying) {
            audio.pause();
            playIcon.className = "fas fa-play";
        } else {
            audio.play().catch((e) => {
                // Handle the error
                console.error("Audio playback error:", e);
                alert("Audio playback failed. Please try again later.");
            });
            playIcon.className = "fas fa-pause";
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener("timeupdate", () => {
        const currentTime = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration || 0);
        audioTime.textContent = `${currentTime} / ${duration}`;

        const progress = (audio.currentTime / audio.duration) * 100 || 0;
        audioProgressBar.style.width = `${progress}%`;
    });

    audio.addEventListener("ended", () => {
        playIcon.className = "fas fa-play";
        isPlaying = false;
        audioProgressBar.style.width = "0%";
    });

    audioProgress.addEventListener("click", (e) => {
        const rect = audioProgress.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        audio.currentTime = position * audio.duration;
    });

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    }

    // Scripture modal functionality
    const scriptureButtons = document.querySelectorAll(".scripture-button");
    const scriptureModal = document.getElementById("scriptureModal");
    const closeModal = document.getElementById("closeModal");
    const scriptureTitle = document.getElementById("scriptureTitle");
    const scriptureContent = document.getElementById("scriptureContent");
    const versionSelector = document.getElementById("versionSelector");

    // Scripture data (simplified for demonstration)
    const scriptures = {
        "colossians-3-12-14": {
            kjv: "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering; Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye. And above all these things put on charity, which is the bond of perfectness.",
            niv: "Therefore, as God's chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience. Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you. And over all these virtues put on love, which binds them all together in perfect unity.",
            nlt: "Since God chose you to be the holy people he loves, you must clothe yourselves with tenderhearted mercy, kindness, humility, gentleness, and patience. Make allowance for each other's faults, and forgive anyone who offends you. Remember, the Lord forgave you, so you must forgive others. Above all, clothe yourselves with love, which binds us all together in perfect harmony.",
            esv: "Put on then, as God's chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience, bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive. And above all these put on love, which binds everything together in perfect harmony.",
            amp: "So, as those who have been chosen of God, holy and beloved, put on a heart of compassion, kindness, humility, gentleness and patience; bearing with one another, and forgiving each other, whoever has a complaint against anyone; just as the Lord forgave you, so also should you. Beyond all these things put on love, which is the perfect bond of unity.",
        },
        "matthew-6-15": {
            kjv: "But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.",
            niv: "But if you do not forgive others their sins, your Father will not forgive your sins.",
            nlt: "But if you refuse to forgive others, your Father will not forgive your sins.",
            esv: "But if you do not forgive others their trespasses, neither will your Father forgive your trespasses.",
            amp: "But if you do not forgive others [nurturing your hurt and anger with the result that it interferes with your relationship with God], then your Father will not forgive your trespasses.",
        },
        "ephesians-4-32": {
            kjv: "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
            niv: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
            nlt: "Instead, be kind to each other, tenderhearted, forgiving one another, just as God through Christ has forgiven you.",
            esv: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.",
            amp: "Be kind to one another, tender-hearted, forgiving each other, just as God in Christ also has forgiven you.",
        },
        "2-corinthians-2-7": {
            kjv: "So that contrariwise ye ought rather to forgive him, and comfort him, lest perhaps such a one should be swallowed up with overmuch sorrow.",
            niv: "Now instead, you ought to forgive and comfort him, so that he will not be overwhelmed by excessive sorrow.",
            nlt: "Now it is time to forgive and comfort him. Otherwise he may be overcome by discouragement.",
            esv: "So you should rather turn to forgive and comfort him, or he may be overwhelmed by excessive sorrow.",
            amp: "So instead, you should rather forgive and comfort him, to keep him from being overwhelmed by excessive sorrow.",
        },
        "colossians-3-13": {
            kjv: "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.",
            niv: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.",
            nlt: "Make allowance for each other's faults, and forgive anyone who offends you. Remember, the Lord forgave you, so you must forgive others.",
            esv: "bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.",
            amp: "bearing with one another, and forgiving each other, whoever has a complaint against anyone; just as the Lord forgave you, so also should you.",
        },
        "matthew-6-12": {
            kjv: "And forgive us our debts, as we forgive our debtors.",
            niv: "And forgive us our debts, as we also have forgiven our debtors.",
            nlt: "and forgive us our sins, as we have forgiven those who sin against us.",
            esv: "and forgive us our debts, as we also have forgiven our debtors.",
            amp: "And forgive us our debts, as we have forgiven our debtors [letting go of both the wrong and the resentment].",
        },
        "matthew-6-14-15": {
            kjv: "For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.",
            niv: "For if you forgive other people when they sin against you, your heavenly Father will also forgive you. But if you do not forgive others their sins, your Father will not forgive your sins.",
            nlt: "If you forgive those who sin against you, your heavenly Father will forgive you. But if you refuse to forgive others, your Father will not forgive your sins.",
            esv: "For if you forgive others their trespasses, your heavenly Father will also forgive you, but if you do not forgive others their trespasses, neither will your Father forgive your trespasses.",
            amp: "For if you forgive others their trespasses [their reckless and willful sins], your heavenly Father will also forgive you. But if you do not forgive others [nurturing your hurt and anger with the result that it interferes with your relationship with God], then your Father will not forgive your trespasses.",
        },
        "mark-11-25-26": {
            kjv: "And when ye stand praying, forgive, if ye have ought against any: that your Father also which is in heaven may forgive you your trespasses. But if ye do not forgive, neither will your Father which is in heaven forgive your trespasses.",
            niv: "And when you stand praying, if you hold anything against anyone, forgive them, so that your Father in heaven may forgive you your sins.",
            nlt: "But when you are praying, first forgive anyone you are holding a grudge against, so that your Father in heaven will forgive your sins, too.",
            esv: "And whenever you stand praying, forgive, if you have anything against anyone, so that your Father also who is in heaven may forgive you your trespasses.",
            amp: "Whenever you stand praying, if you have anything against anyone, forgive him [drop the issue, let it go], so that your Father who is in heaven will also forgive you your transgressions and wrongdoings [against Him and others].",
        },
        "matthew-18-34": {
            kjv: "And his lord was wroth, and delivered him to the tormentors, till he should pay all that was due unto him.",
            niv: "In anger his master handed him over to the jailers to be tortured, until he should pay back all he owed.",
            nlt: "Then the angry king sent the man to prison to be tortured until he had paid his entire debt.",
            esv: "And in anger his master delivered him to the jailers, until he should pay all his debt.",
            amp: "And in wrath his master turned him over to the torturers (jailers) until he paid all that he owed.",
        },
        "matthew-18-35": {
            kjv: "So likewise shall my heavenly Father do also unto you, if ye from your hearts forgive not every one his brother their trespasses.",
            niv: "This is how my heavenly Father will treat each of you unless you forgive your brother or sister from your heart.",
            nlt: "That's what my heavenly Father will do to you if you refuse to forgive your brothers and sisters from your heart.",
            esv: "So also my heavenly Father will do to every one of you, if you do not forgive your brother from your heart.",
            amp: "My heavenly Father will also do the same to [every one of] you, if each of you does not forgive his brother from your heart.",
        },
    };

    // Open modal with scripture
    scriptureButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const reference = button.getAttribute("data-ref");
            const version = versionSelector.value;

            // Format the reference for display
            const formattedRef = reference
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ")
                .replace(/(\d+)(\D+)(\d+)/, "$1 $2 $3:");

            scriptureTitle.textContent = formattedRef;
            scriptureModal.setAttribute("data-reference", reference);
            updateScriptureContent(reference, version);

            scriptureModal.style.display = "flex";
            setTimeout(() => {
                scriptureModal.style.opacity = "1";
            }, 50);
        });
    });

    closeModal.addEventListener("click", () => {
        scriptureModal.style.opacity = "0";
        setTimeout(() => {
            scriptureModal.style.display = "none";
        }, 300);
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === scriptureModal) {
            closeModal.click();
        }
    });

    versionSelector.addEventListener("change", () => {
        const reference = scriptureModal.getAttribute("data-reference");
        const version = versionSelector.value.toLowerCase();
        updateScriptureContent(reference, version);
    });

    function updateScriptureContent(reference, version) {
        try {
            // Show loader
            scriptureContent.innerHTML = `
                <div class="scripture-loader" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
                    <div class="loader-spinner" style="width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p class="loader-text" style="margin-top: 1rem; color: var(--text); animation: pulse 1.5s infinite;">Loading Scripture...</p>
                </div>
            `;

            // Add small delay to show loader
            setTimeout(() => {
                if (!reference || !scriptures[reference]) {
                    throw new Error('Scripture reference not found');
                }

                const scripture = scriptures[reference];
                const content = scripture[version.toLowerCase()];

                if (!content) {
                    throw new Error(`Version ${version.toUpperCase()} not available`);
                }

                const isMultiVerse = reference.includes('-');
                let formattedContent = '';

                if (isMultiVerse) {
                    const verses = content.split(/(?<=\.)\s+/);
                    const verseMatch = reference.match(/(\d+)(?:-\d+)?$/);
                    const startVerse = verseMatch ? parseInt(verseMatch[1]) : 1;
                    
                    formattedContent = verses.map((verse, index) => {
                        const verseNumber = startVerse + index;
                        return `<span class="verse"><sup class="verse-number">${verseNumber}</sup>${verse.trim()}</span>`;
                    }).join(' ');
                } else {
                    const verseMatch = reference.match(/(\d+)$/);
                    const verseNumber = verseMatch ? verseMatch[1] : '';
                    formattedContent = `<span class="verse">${verseNumber ? `<sup class="verse-number">${verseNumber}</sup>` : ''}${content}</span>`;
                }

                scriptureContent.innerHTML = `
                    <div class="scripture-text fade-in">
                        <p>${formattedContent}</p>
                    </div>
                `;
            }, 800); // Show loader for at least 800ms

        } catch (error) {
            console.error('Scripture loading error:', error);
            scriptureContent.innerHTML = `
                <div class="scripture-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message || 'Error loading scripture. Please try again.'}</p>
                </div>
            `;
        }
    }

    // High contrast mode
    const highContrastBtn = document.getElementById("highContrast");
    let isHighContrast = localStorage.getItem("highContrast") === "true";

    // Apply saved contrast mode on page load
    if (isHighContrast) {
        document.body.classList.add("high-contrast");
    }

    highContrastBtn.addEventListener("click", () => {
        isHighContrast = !isHighContrast;
        document.body.classList.toggle("high-contrast", isHighContrast);
        localStorage.setItem("highContrast", isHighContrast);
    });

    // Font size controls
    const decreaseFont = document.getElementById("decreaseFont");
    const increaseFont = document.getElementById("increaseFont");
    let currentFontSize = parseInt(localStorage.getItem("fontSize")) || 100;

    // Apply saved font size on page load
    document.body.style.fontSize = `${currentFontSize}%`;

    decreaseFont.addEventListener("click", () => {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            updateFontSize();
        }
    });

    increaseFont.addEventListener("click", () => {
        if (currentFontSize < 150) {
            currentFontSize += 10;
            updateFontSize();
        }
    });

    function updateFontSize() {
        document.body.style.fontSize = `${currentFontSize}%`;
        localStorage.setItem("fontSize", currentFontSize);
    }

    // Notes functionality
    const introductionNotes = document.getElementById("introductionNotes");
    const saveIntroNotes = document.getElementById("saveIntroNotes");
    const introNotesSaved = document.getElementById("introNotesSaved");

    const lessonNotes = document.getElementById("lessonNotes");
    const saveLessonNotes = document.getElementById("saveLessonNotes");
    const lessonNotesSaved = document.getElementById("lessonNotesSaved");

    // Load saved notes on page load
    introductionNotes.value = localStorage.getItem("introductionNotes") || "";
    lessonNotes.value = localStorage.getItem("lessonNotes") || "";

    saveIntroNotes.addEventListener("click", () => {
        localStorage.setItem("introductionNotes", introductionNotes.value);
        showSavedMessage(introNotesSaved);
    });

    saveLessonNotes.addEventListener("click", () => {
        localStorage.setItem("lessonNotes", lessonNotes.value);
        showSavedMessage(lessonNotesSaved);
    });

    function showSavedMessage(element) {
        element.style.display = "block";
        setTimeout(() => {
            element.style.display = "none";
        }, 2000);
    }

    // Personal reflection
    const reflectionText = document.getElementById("reflectionText");
    const saveReflection = document.getElementById("saveReflection");
    const savedMessage = document.getElementById("savedMessage");

    // Load saved reflection on page load
    reflectionText.value = localStorage.getItem("reflection") || "";

    saveReflection.addEventListener("click", () => {
        localStorage.setItem("reflection", reflectionText.value);
        savedMessage.style.display = "block";
        setTimeout(() => {
            savedMessage.style.display = "none";
        }, 2000);
    });

    // Quiz functionality
    const submitQuiz = document.getElementById("submitQuiz");
    const quizResult = document.getElementById("quizResult");

    submitQuiz.addEventListener("click", () => {
        const answers = {
            q1: document.querySelector('input[name="q1"]:checked')?.value,
            q2: document.querySelector('input[name="q2"]:checked')?.value,
            q3: document.querySelector('input[name="q3"]:checked')?.value,
            q4: document.querySelector('input[name="q4"]:checked')?.value,
            q5: document.querySelector('input[name="q5"]:checked')?.value,
        };

        const correctAnswers = {
            q1: "b", // Our Father will not forgive our trespasses
            q2: "b", // A command from God
            q3: "c", // The inner man (heart)
            q4: "c", // You will be handed over to tormentors
            q5: "a", // A matter of choice
        };

        let score = 0;
        let total = Object.keys(correctAnswers).length;

        // Calculate score
        for (const [question, answer] of Object.entries(answers)) {
            if (answer === correctAnswers[question]) {
                score++;
            }
        }

        // Check if all questions were answered
        const unanswered = Object.values(answers).filter((a) => !a).length;

        if (unanswered > 0) {
            quizResult.innerHTML = `<p class="error">Please answer all questions.</p>`;
            quizResult.style.display = "block";
            return;
        }

        // Show result
        const percentage = Math.round((score / total) * 100);
        let message;

        if (percentage >= 80) {
            message =
                "Excellent! You have a good understanding of forgiveness.";
        } else if (percentage >= 60) {
            message =
                "Good job! You understand most of the concepts about forgiveness.";
        } else {
            message =
                "You might want to review the lesson again to better understand forgiveness.";
        }

        quizResult.innerHTML = `
            <p class="score">You scored ${score}/${total} (${percentage}%)</p>
            <p class="message">${message}</p>
            <div class="answers-review">
                <h4>Review:</h4>
                <ul>
                    ${Object.entries(answers)
                        .map(([q, a]) => {
                            const isCorrect = a === correctAnswers[q];
                            return `<li class="${
                                isCorrect ? "correct" : "incorrect"
                            }">
                            Question ${q.slice(1)}: ${
                                isCorrect ? "Correct" : "Incorrect"
                            }
                        </li>`;
                        })
                        .join("")}
                </ul>
            </div>
        `;

        quizResult.style.display = "block";

        // Save quiz results
        localStorage.setItem("quizScore", score);
        localStorage.setItem("quizCompleted", "true");
    });

    // Share functionality
    const shareBtn = document.getElementById("shareBtn");

    shareBtn.addEventListener("click", () => {
        if (navigator.share) {
            navigator
                .share({
                    title: "Sunday School Lesson: The Real Christian Clothings - Forgiveness",
                    text: "Check out this Sunday School lesson on forgiveness!",
                    url: window.location.href,
                })
                .catch((err) => {
                    console.error("Share failed:", err);
                    alert(
                        "Sharing failed. Please try again or share manually."
                    );
                });
        } else {
            // Fallback for browsers that don't support Web Share API
            const dummy = document.createElement("textarea");
            dummy.value = window.location.href;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);

            alert("Link copied to clipboard! You can now paste it to share.");
        }
    });

    // Print functionality
    const printBtn = document.getElementById("printBtn");

    printBtn.addEventListener("click", () => {
        window.print();
    });

    // Service Worker registration for PWA support
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/service-worker.js")
                .then((registration) => {
                    console.log(
                        "ServiceWorker registration successful with scope: ",
                        registration.scope
                    );
                })
                .catch((err) => {
                    console.log("ServiceWorker registration failed: ", err);
                });
        });
    }

    // Offline data sync
    function syncData() {
        // Check if we're online before trying to sync
        if (navigator.onLine) {
            const userData = {
                notes: {
                    introduction:
                        localStorage.getItem("introductionNotes") || "",
                    lesson: localStorage.getItem("lessonNotes") || "",
                },
                reflection: localStorage.getItem("reflection") || "",
                quizScore: localStorage.getItem("quizScore") || 0,
                quizCompleted: localStorage.getItem("quizCompleted") === "true",
            };

            // Here you would normally send this data to your server
            console.log("Data synced:", userData);

            // For demonstration, we'll just log it
            localStorage.setItem("lastSynced", new Date().toISOString());
        }
    }

    // Try to sync data when the app loads and periodically
    syncData();
    setInterval(syncData, 5 * 60 * 1000); // Sync every 5 minutes

    // Sync when we come back online
    window.addEventListener("online", syncData);

    // Scroll active tab into view
    scrollActiveTabIntoView();

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.classList.add('ripple');
    });

    // Add scroll progress indicator
    const progressBarIndicator = document.createElement('div');
    progressBarIndicator.className = 'progress-indicator';
    progressBarIndicator.innerHTML = '<div class="progress-bar"></div>';
    document.body.appendChild(progressBarIndicator);

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.querySelector('.progress-bar').style.width = scrolled + '%';
    });

    // Add hover effect for sections with content preview
    document.querySelectorAll('.section').forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'scale(1.02)';
            section.style.zIndex = '1';
        });

        section.addEventListener('mouseleave', () => {
            section.style.transform = 'scale(1)';
            section.style.zIndex = '0';
        });
    });

    // Add smooth scroll to section links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Save user's progress
    function saveProgress() {
        const progress = {
            completedSections: [],
            lastTab: document.querySelector('.tab.active')?.dataset.tab,
            scrollPosition: window.scrollY
        };
        
        document.querySelectorAll('.section').forEach(section => {
            if (section.dataset.completed === 'true') {
                progress.completedSections.push(section.id);
            }
        });
        
        localStorage.setItem('userProgress', JSON.stringify(progress));
    }

    // Load user's progress
    function loadProgress() {
        const progress = JSON.parse(localStorage.getItem('userProgress'));
        if (progress) {
            progress.completedSections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.dataset.completed = 'true';
                    section.classList.add('completed');
                }
            });
            
            if (progress.lastTab) {
                document.querySelector(`[data-tab="${progress.lastTab}"]`)?.click();
            }
            
            window.scrollTo({
                top: progress.scrollPosition,
                behavior: 'smooth'
            });
        }
    }

    // Save progress periodically
    setInterval(saveProgress, 30000);
});

function scrollActiveTabIntoView() {
    const activeTab = document.querySelector('.tab.active');
    const tabsContainer = document.querySelector('.tabs');
    
    if (activeTab && tabsContainer) {
        // Scroll the active tab to the start of the container
        tabsContainer.scrollLeft = activeTab.offsetLeft - tabsContainer.offsetLeft;
    }
}

// Call this function when switching tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // ... existing tab switching code ...
        
        // Add small delay to ensure DOM updates
        setTimeout(scrollActiveTabIntoView, 100);
    });
});

// Also call on page load
document.addEventListener('DOMContentLoaded', () => {
    scrollActiveTabIntoView();
    loadProgress();
});
