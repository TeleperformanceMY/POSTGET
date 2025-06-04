document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    let currentLanguage = 'en';
    let statusChart = null;
    
    // User database (mock data)
    const userDatabase = {
        "0123456789:amr@tp.com": {
            fullName: "Amr EzZ",
            email: "amr@tp.com",
            phone: "0123456789"
        },
        "0174669871:loai@example.com": {
            fullName: "Loai Doe",
            email: "loai@example.com",
            phone: "0174669871"
        },
        "0182708243:tarek@example.com": {
            fullName: "Tarek Smith",
            email: "tarek@example.com",
            phone: "0182708243"
        },
        "0173890590:pourya@example.com": {
            fullName: "Pourya Johnson",
            email: "pourya@example.com",
            phone: "0173890590"
        }
    };
    
    // Status mapping configuration
    const statusMapping = {
        "statusGroups": {
            "Hired (Confirmed)": ["Hired (Confirmed)", "New Starter (Hired)", "Graduate"],
            "Hired (Probation)": ["Hired (Probation)"],
            "Previously Applied (No Payment)": ["Previously Applied (No Payment)"],
            "Final Review": ["Final Review", "Ready to Offer", "Job Offer Presented", "Onboarding Started", "Cleared to Start"],
            "Interview Stage": ["Interview Stage", "Interview Scheduled", "Interview Complete / Offer Requested", "Second Interview Scheduled", "Second Interview Complete / Offer Requested", "Third Interview Scheduled", "Third Interview Complete / Offer Requested"],
            "Assessment Stage": ["Assessment Stage", "SHL Assessment: Conversational Multichat ENG", "SHL Assessment: Sales Competency ENG", "SHL Assessment: System Diagnostic ENG", "SHL Assessment: Typing ENG", "SHL Assessment: WriteX E-mail ENG", "Contact Attempt 1", "Contact Attempt 2", "Contact Attempt 3"],
            "Application Received": ["Application Received", "TextApply", "External Portal", "Internal Portal", "Recruiter Submitted", "Agency Submissions", "Employee Referral"],
            "Not Selected": [
                "Eliminated - Age", "Eliminated - Availability", "Eliminated - CV/Resume Analysis", "Eliminated - Did not start Assessment", 
                "Eliminated - Incomplete Assessment", "Eliminated - Language", "Eliminated - Location/Country", "Eliminated - No Hire List/Not Rehireable", 
                "Eliminated - Processed on another Requisition", "Eliminated - Unprocessed Candidate", "Eliminated - Unreachable/Unresponsive", 
                "Eliminated - WAH - Connectivity Requirements", "Eliminated - WAH - Technical Requirements", "Eliminated - Assessment Results Did Not Meet Criteria",
                "Eliminated - No Show", "Eliminated - No Show (Interview 1)", "Eliminated - No Show (Interview 2)", "Eliminated - No Show (Interview 3)",
                "Eliminated - Interview 1 Complete (Reject)", "Eliminated - Interview 2 Complete (Reject)", "Eliminated - Interview 3 Complete (Reject)",
                "Eliminated - Availability (Interview 1)", "Eliminated - Age (Pre-Offer)", "Eliminated - Age (Post Offer)", 
                "Eliminated - Employment Eligibility Verification", "Eliminated - Falsified Application", "Eliminated - Ineligible (Background)", 
                "Eliminated - Ineligible (Drug Test)", "Eliminated - Offer Rescinded (Pre-Offer)", "Eliminated - Offer Rescinded (Post Offer)", 
                "Eliminated - Unreachable/Unresponsive (Pre-Offer)", "Eliminated - Unreachable/Unresponsive (Post Offer)",
                "Withdrew - Country", "Withdrew - Location", "Withdrew - Long-Term Commitment", "Withdrew - No Reason Given", 
                "Withdrew - Other Job Offer", "Withdrew - Salary", "Withdrew - Schedule", "Withdrew - Job Fit (Interview 1)", 
                "Withdrew - Job Fit (Interview 2)", "Withdrew - Job Fit (Interview 3)", "Withdrew - Other Job Offer (Interview 1)", 
                "Withdrew - Other Job Offer (Interview 2)", "Withdrew - Other Job Offer (Interview 3)", "Withdrew - Personal/Family (Interview 1)",
                "Withdrew - Personal/Family (Interview 2)", "Withdrew - Personal/Family (Interview 3)", "Withdrew - Salary (Interview 1)",
                "Withdrew - Salary (Interview 2)", "Withdrew - Salary (Interview 3)", "Withdrew - Schedule (Interview 1)",
                "Withdrew - Schedule (Interview 2)", "Withdrew - Schedule (Interview 3)", "Withdrew - Medical (Pre-Offer)",
                "Withdrew - Medical (Post Offer)", "Withdrew - Offer Declined/Rejected", "Withdrew - Onboarding Incomplete",
                "Withdrew - Other Job Offer (Pre-Offer)", "Withdrew - Other Job Offer (Post Offer)", "Withdrew - Personal/Family (Pre-Offer)",
                "Withdrew - Personal/Family (Post Offer)", "Withdrew - Role (Pre-Offer)", "Withdrew - Role (Post Offer)",
                "Withdrew - Salary (Pre-Offer)", "Withdrew - Salary (Post Offer)", "Withdrew - Schedule (Pre-Offer)",
                "Withdrew - Schedule (Post Offer)", "Legacy - Age", "Legacy - Anonymous by GDPR", "Legacy - Availability",
                "Legacy - Behavior", "Legacy - Communication Skills", "Legacy - Criminal Record", "Legacy - CV Analysis",
                "Legacy - Education", "Legacy - Falsified Application", "Legacy - Invalid Phone Number", "Legacy - Language",
                "Legacy - Long-term Commitment", "Legacy - Motivation", "Legacy - No Hire List", "Legacy - No Show",
                "Legacy - Not Re-hirable", "Legacy - Recording Denied", "Legacy - Reference Check", "Legacy - Salary Expectation",
                "Legacy - Soft Skills", "Legacy - Unreachable", "Legacy - WAH - Connectivity Requirements", "Legacy - WAH - Contract",
                "Legacy - WAH - Technical Requirements", "Legacy - Work Permit", "Legacy - Country", "Legacy - Did Not Apply",
                "Legacy - Incomplete Assessment", "Legacy - Location", "Legacy - Medical", "Legacy - Negative Review of TP",
                "Legacy - No Reason Given", "Legacy - Other Job Offer", "Legacy - Personal/Family", "Legacy - Project",
                "Legacy - Role", "Legacy - Salary Conditions", "Legacy - Schedule", "Legacy - Security Condition",
                "Self-Withdrew (Recruiter)", "Self-Withdrew (Portal)"
            ]
        },
        "displayOrder": [
            "Hired (Confirmed)",
            "Hired (Probation)",
            "Previously Applied (No Payment)",
            "Final Review",
            "Interview Stage",
            "Assessment Stage",
            "Application Received",
            "Not Selected"
        ]
    };

    // Function to map a status to its simplified group
    function mapStatusToGroup(status) {
        if (!statusMapping.statusGroups) return status;
        
        for (const [group, statuses] of Object.entries(statusMapping.statusGroups)) {
            if (statuses.includes(status)) {
                return group;
            }
        }
        
        // If not found in any group, check if it starts with "Eliminated" or "Withdrew"
        if (status.startsWith("Eliminated") || status.startsWith("Withdrew") || status.startsWith("Legacy")) {
            return "Not Selected";
        }
        
        return status;
    }

    // Helper function to get simplified status type
    function getSimplifiedStatusType(status) {
        const mappedStatus = mapStatusToGroup(status);
        
        switch(mappedStatus) {
            case "Hired (Confirmed)":
                return "passed";
            case "Hired (Probation)":
                return "probation";
            case "Previously Applied (No Payment)":
                return "previouslyApplied";
            case "Final Review":
                return "operations";
            case "Interview Stage":
                return "talent";
            case "Assessment Stage":
                return "assessment";
            case "Application Received":
                return "received";
            case "Not Selected":
                return "failed";
            default:
                return "received";
        }
    }

    // Update translations
    function updateTranslations() {
        const translation = translations[currentLanguage] || translations.en;
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translation[key]) {
                el.textContent = translation[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translation[key]) {
                el.placeholder = translation[key];
            }
        });
    }
    
    // Language change handler
    document.getElementById('lang-select').addEventListener('change', function() {
        currentLanguage = this.value;
        updateTranslations();
        
        // Refresh chart if it exists
        if (statusChart) {
            const referrals = getCurrentReferrals();
            if (referrals) {
                updateChart(referrals);
                updateEarningsTable(referrals);
                updateReminderSection(referrals);
                updateReferralList(referrals);
            }
        }
    });
    
    // Validate phone number
    function validatePhone(phone) {
        const regex = /^01\d{8,9}$/;
        return regex.test(phone);
    }
    
    // Validate email (case insensitive)
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return regex.test(email) && email.length <= 254;
    }
    
    // Show error message
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.add('was-validated');
        error.textContent = message;
        error.style.display = 'block';
        input.classList.add('is-invalid');
    }
    
    // Clear error
    function clearError(input) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.remove('was-validated');
        error.style.display = 'none';
        input.classList.remove('is-invalid');
    }
    
    // Get referrals for current user
    function getReferrals(phone, email) {
        const key = `${phone}:${email.toLowerCase()}`; // Case insensitive email matching
        return sampleData[key] || null;
    }
    
    // Get current referrals (for chart refresh)
    function getCurrentReferrals() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        return getReferrals(phone, email);
    }
    
    // Get user info
    function getUserInfo(phone, email) {
        const key = `${phone}:${email.toLowerCase()}`;
        return userDatabase[key] || null;
    }
    
    // Get status badge color with payment eligibility check
    function getStatusBadgeColor(statusType, daysInStage = 0, isPreviousCandidate = false) {
        if (isPreviousCandidate) {
            return 'previously-applied';
        }
        
        switch(statusType) {
            case 'passed':
                return daysInStage >= 90 ? 'success' : 'warning';
            case 'probation':
                return 'warning';
            case 'previouslyApplied':
                return 'previously-applied';
            case 'assessment':
            case 'talent':
            case 'operations':
                return 'warning';
            case 'failed':
                return 'danger';
            default:
                return 'secondary';
        }
    }
    
    // Update earnings table
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        earningsBody.innerHTML = '';
        
        let totalEarnings = 0;
        
        // Calculate assessment passes (not previously applied)
        const assessmentPasses = referrals.filter(r => 
            r.statusType === 'passed' && 
            !r.isPreviousCandidate
        );
        
        // Calculate probation completions (not previously applied)
        const probationCompletions = referrals.filter(r => 
            r.statusType === 'passed' && 
            r.daysInStage >= 90 && 
            !r.isPreviousCandidate
        );
        
        // Add rows for each earning type
        Object.entries(earningsStructure).forEach(([key, earning]) => {
            const count = key === 'assessment' ? assessmentPasses.length : probationCompletions.length;
            const total = count * earning.amount;
            totalEarnings += total;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${translations[currentLanguage][`status${key.charAt(0).toUpperCase() + key.slice(1)}`] || earning.label}</td>
                <td>RM ${earning.amount}</td>
                <td>${count}</td>
                <td>RM ${total}</td>
            `;
            earningsBody.appendChild(row);
        });
        
        // Update total earnings
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings}`;
    }
    
    // Update reminder section
    function updateReminderSection(referrals) {
        const friendsToRemind = document.getElementById('friends-to-remind');
        friendsToRemind.innerHTML = '';
        
        // Filter out previously applied candidates
        const friendsNeedingReminder = referrals
            .filter(r => r.needsAction && !r.isPreviousCandidate)
            .sort((a, b) => {
                const statusOrder = ['assessment', 'talent', 'operations', 'received'];
                return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
            });
        
        if (friendsNeedingReminder.length === 0) {
            friendsToRemind.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
                </div>
            `;
            updateTranslations();
            return;
        }
        
        friendsNeedingReminder.forEach(friend => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            
            col.innerHTML = `
                <div class="friend-to-remind status-${friend.statusType}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5>${friend.name}</h5>
                        <span class="badge status-badge bg-${getStatusBadgeColor(friend.statusType)}">
                            ${translations[currentLanguage][`status${friend.statusType.charAt(0).toUpperCase() + friend.statusType.slice(1)}`]}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">${friend.email}</p>
                    <p class="small mb-2"><strong>${translations[currentLanguage].referralDays}:</strong> ${friend.daysInStage}</p>
                    <button class="btn btn-sm btn-primary w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${friend.phone}" 
                            data-translate="remindBtn">
                        <i class="fab fa-whatsapp me-2"></i>${translations[currentLanguage].remindBtn}
                    </button>
                </div>
            `;
            
            friendsToRemind.appendChild(col);
        });
        
        updateTranslations();
    }
    
    // Form submission
  // Form submission
document.getElementById('dashboard-submit').addEventListener('click', function () {
    const phone = document.getElementById('dashboard-phone').value.trim();
    const email = document.getElementById('dashboard-email').value.trim();
    let isValid = true;

    // Validate phone
    if (!phone) {
        showError(document.getElementById('dashboard-phone'),
            translations[currentLanguage].phoneError);
        isValid = false;
    } else if (!validatePhone(phone)) {
        showError(document.getElementById('dashboard-phone'),
            translations[currentLanguage].phoneError);
        isValid = false;
    } else {
        clearError(document.getElementById('dashboard-phone'));
    }

    // Validate email
    if (!email) {
        showError(document.getElementById('dashboard-email'),
            translations[currentLanguage].emailError);
        isValid = false;
    } else if (!validateEmail(email)) {
        showError(document.getElementById('dashboard-email'),
            translations[currentLanguage].emailError);
        isValid = false;
    } else {
        clearError(document.getElementById('dashboard-email'));
    }

    if (!isValid) return;

    // 🔁 Replace local getReferrals with live Power Automate call
    fetch("https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, email })
    })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                showReferralResults(data, phone, email);
            } else {
                const userNotFoundModal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
                userNotFoundModal.show();
            }
        })
        .catch(error => {
            console.error("Error calling Power Automate:", error);
            const userNotFoundModal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
            userNotFoundModal.show();
        });
});

    
    // Show referral results
    function showReferralResults(referrals, phone, email) {
        document.getElementById('auth-step').style.display = 'none';
        document.getElementById('results-step').style.display = 'block';
        
        // Get user info
        const userInfo = getUserInfo(phone, email);
        
        // Create results content
        const resultsContent = `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    ${userInfo ? `<h3 class="user-name-display">${userInfo.fullName}</h3>` : ''}
                    <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            
            <div id="referral-stats" class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary" id="total-referrals">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success" id="hired-referrals">${referrals.filter(r => r.stage === 'Hired').length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="inProgress">In Progress</h5>
                            <h3 class="text-warning" id="progress-referrals">${referrals.filter(r => r.stage !== 'Hired').length}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-3">
                <div class="card-body">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="filteredViewToggle">
                        <label class="form-check-label" for="filteredViewToggle" data-translate="filteredViewLabel">Simplified Status View</label>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
                    <div class="chart-container" style="height: 300px; width: 100%; margin: 0 auto;">
                        <canvas id="statusChart"></canvas>
                        <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
                    </div>
                    <div class="chart-legend text-center mt-3" id="chartLegend"></div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
                    <div class="table-responsive">
                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th data-translate="earningsStage">Stage</th>
                                    <th data-translate="earningsAmount">Amount (RM)</th>
                                    <th data-translate="earningsCount">Count</th>
                                    <th data-translate="earningsTotal">Total</th>
                                </tr>
                            </thead>
                            <tbody id="earnings-body"></tbody>
                            <tfoot>
                                <tr>
                                    <th data-translate="earningsTotal">Total Earnings</th>
                                    <th></th>
                                    <th></th>
                                    <th id="total-earnings">RM 0</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
                            Payment Terms & Conditions
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="reminder-section" class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
                    <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join Teleperformance!</p>
                    <div id="friends-to-remind" class="row"></div>
                </div>
            </div>
            
            <div id="referral-list"></div>
            
            <!-- Status Examples Section -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3">Status Examples</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="status-example status-passed">
                                <h5>Passed Probation</h5>
                                <p>Candidate completed 90+ days</p>
                                <span class="badge bg-success">${translations[currentLanguage].statusPassed}</span>
                            </div>
                            <div class="status-example status-probation">
                                <h5>In Probation</h5>
                                <p>Candidate hired but under 90 days</p>
                                <span class="badge bg-warning text-dark">${translations[currentLanguage].statusProbation}</span>
                            </div>
                            <div class="status-example status-operations">
                                <h5>Final Review</h5>
                                <p>Operations team finalizing</p>
                                <span class="badge bg-warning text-dark">${translations[currentLanguage].statusOperations}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="status-example status-previously-applied">
                                <h5>Previously Applied</h5>
                                <p>No payment will be made</p>
                                <span class="badge bg-previously-applied">${translations[currentLanguage].statusPreviouslyApplied}</span>
                            </div>
                            <div class="status-example status-failed">
                                <h5>Not Selected</h5>
                                <p>Candidate not hired</p>
                                <span class="badge bg-danger">${translations[currentLanguage].statusFailed}</span>
                            </div>
                            <div class="status-example status-received">
                                <h5>Application Received</h5>
                                <p>Initial application stage</p>
                                <span class="badge bg-secondary">${translations[currentLanguage].statusReceived}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Social Media -->
            <div class="mt-4">
                <div class="row text-center">
                    <!-- TP Global -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="tpGlobal">TP Global</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.linkedin.com/company/teleperformance" class="social-icon" target="_blank"><i class="fab fa-linkedin"></i></a>
                            <a href="https://www.youtube.com/@TeleperformanceGroup" class="social-icon" target="_blank"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.tiktok.com/@teleperformance_group" class="social-icon" target="_blank"><i class="fab fa-tiktok"></i></a>
                        </div>
                    </div>
                    <!-- TP Malaysia -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followMalaysia">TP Malaysia</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.facebook.com/TPinMalaysia/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tp_malaysia/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <!-- TP Thailand -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followThailand">TP Thailand</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="http://www.facebook.com/TPinThailand/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tpinthailand/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('results-step').innerHTML = resultsContent;
        
        // Update stats
        document.getElementById('total-referrals').textContent = referrals.length;
        document.getElementById('hired-referrals').textContent = referrals.filter(r => r.stage === 'Hired').length;
        document.getElementById('progress-referrals').textContent = referrals.filter(r => r.stage !== 'Hired').length;
        
        // Update chart
        updateChart(referrals);
        
        // Update earnings table
        updateEarningsTable(referrals);
        
        // Update reminder section
        updateReminderSection(referrals);
        
        // Update referral list
        updateReferralList(referrals);
        
        // Re-attach back button event
        document.getElementById('dashboard-back').addEventListener('click', function() {
            document.getElementById('auth-step').style.display = 'block';
            document.getElementById('results-step').style.display = 'none';
        });
        
        // Add event listener for filtered view toggle
        document.getElementById('filteredViewToggle').addEventListener('change', function() {
            updateChart(referrals);
            updateReferralList(referrals);
        });
        
        // Update translations
        updateTranslations();
    }
    
    // Update referral list
    function updateReferralList(referrals) {
        const referralList = document.getElementById('referral-list');
        referralList.innerHTML = '';
        
        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="alert alert-info" data-translate="noReferrals">
                    ${translations[currentLanguage].noReferrals}
                </div>
            `;
            updateTranslations();
            return;
        }
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Process referrals based on view mode
        const processedReferrals = referrals.map(r => {
            if (filteredView) {
                return {
                    ...r,
                    status: mapStatusToGroup(r.status),
                    statusType: getSimplifiedStatusType(r.status)
                };
            }
            return r;
        });
        
        // Sort referrals with new status
        const statusOrder = filteredView ? 
            statusMapping.displayOrder || ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'] :
            ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'];
            
        const sortedReferrals = [...processedReferrals].sort((a, b) => {
            return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
        });
        
        sortedReferrals.forEach(referral => {
            const item = document.createElement('div');
            const statusKey = `status${referral.statusType.charAt(0).toUpperCase() + referral.statusType.slice(1)}`;
            const statusTranslation = translations[currentLanguage][statusKey] || referral.status;
            
            // Determine if payment is eligible
            const isPaymentEligible = referral.statusType === 'passed' && 
                                      referral.daysInStage >= 90 && 
                                      !referral.isPreviousCandidate;
            
            item.className = `card mb-3 status-${referral.statusType} ${isPaymentEligible ? 'payment-eligible' : ''}`;
            
            item.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="mb-1">${referral.name}</h5>
                            <p class="mb-1 text-muted small">${referral.email}</p>
                        </div>
                        <span class="badge status-badge bg-${getStatusBadgeColor(referral.statusType, referral.daysInStage, referral.isPreviousCandidate)}">
                            ${statusTranslation}
                        </span>
                    </div>
                    <div class="row">
                        <div class="col-md-3">
                            <small class="text-muted" data-translate="referralStage">Stage</small>
                            <p>${referral.stage}</p>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted" data-translate="referralDate">Application Date</small>
                            <p>${new Date(referral.applicationDate).toLocaleDateString()}</p>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                            <p>${referral.daysInStage}</p>
                        </div>
                        <div class="col-md-3">
                            ${referral.needsAction ? `
                            <button class="btn btn-sm btn-primary w-100 remind-btn" 
                                    data-name="${referral.name}" 
                                    data-phone="${referral.phone}" 
                                    data-translate="remindBtn">
                                <i class="fab fa-whatsapp me-2"></i>${translations[currentLanguage].remindBtn}
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            referralList.appendChild(item);
        });
        
        // Update translations for dynamic content
        updateTranslations();
    }
    
    // Update chart with referral data
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const translation = translations[currentLanguage] || translations.en;
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Count statuses
        let statusCounts = {};
        
        if (filteredView) {
            // Use the simplified status groups
            statusMapping.displayOrder.forEach(group => {
                statusCounts[group] = referrals.filter(r => mapStatusToGroup(r.status) === group).length;
            });
        } else {
            // Original status counting
            statusCounts = {
                passed: referrals.filter(r => r.statusType === 'passed').length,
                probation: referrals.filter(r => r.statusType === 'probation').length,
                previouslyApplied: referrals.filter(r => r.statusType === 'previouslyApplied').length,
                operations: referrals.filter(r => r.statusType === 'operations').length,
                talent: referrals.filter(r => r.statusType === 'talent').length,
                assessment: referrals.filter(r => r.statusType === 'assessment').length,
                received: referrals.filter(r => r.statusType === 'received').length,
                failed: referrals.filter(r => r.statusType === 'failed').length
            };
        }
        
        // Chart data - different setup for filtered vs unfiltered
        const data = filteredView ? {
            labels: statusMapping.displayOrder.map(group => {
                // Try to find a translation, fallback to group name
                const translationKey = `status${group.replace(/\s+/g, '').replace(/[()]/g, '')}`;
                return translation[translationKey] || group;
            }),
            datasets: [{
                data: statusMapping.displayOrder.map(group => statusCounts[group]),
                backgroundColor: [
                    '#28a745', // Hired (Confirmed) - green
                    '#7cb342', // Hired (Probation) - light green
                    '#6c757d', // Previously Applied - gray
                    '#ffc107', // Final Review - yellow
                    '#fd7e14', // Interview Stage - orange
                    '#17a2b8', // Assessment Stage - teal
                    '#6c757d', // Application Received - gray
                    '#dc3545'  // Not Selected - red
                ],
                borderWidth: 1,
                hoverOffset: 20
            }]
        } : {
            // Original chart data setup
            labels: [
                translation.statusPassed,
                translation.statusProbation,
                translation.statusPreviouslyApplied,
                translation.statusOperations,
                translation.statusTalent,
                translation.statusAssessment,
                translation.statusReceived,
                translation.statusFailed
            ],
            datasets: [{
                data: [
                    statusCounts.passed,
                    statusCounts.probation,
                    statusCounts.previouslyApplied,
                    statusCounts.operations,
                    statusCounts.talent,
                    statusCounts.assessment,
                    statusCounts.received,
                    statusCounts.failed
                ],
                backgroundColor: [
                    '#28a745', // Passed - green
                    '#7cb342', // Probation - light green
                    '#6c757d', // Previously applied - gray
                    '#ffc107', // Operations - yellow
                    '#fd7e14', // Talent - orange
                    '#17a2b8', // Assessment - teal
                    '#6c757d', // Received - gray
                    '#dc3545'  // Failed - red
                ],
                borderWidth: 1,
                hoverOffset: 20
            }]
        };

        // Destroy previous chart if exists
        if (statusChart) {
            statusChart.destroy();
        }

        // Create new chart
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false // We'll create custom legend below
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                onResize: function(chart, size) {
                    // Keep logo centered when chart resizes
                    const logo = document.querySelector('.chart-logo');
                    if (logo) {
                        logo.style.left = '50%';
                        logo.style.top = '50%';
                    }
                }
            }
        });

        // Create custom legend below chart
        const legendContainer = document.getElementById('chartLegend');
        legendContainer.innerHTML = '';
        
        data.labels.forEach((label, i) => {
            const legendItem = document.createElement('span');
            legendItem.className = 'd-inline-block mx-2';
            legendItem.innerHTML = `
                <span class="d-inline-block mr-1" style="width: 12px; height: 12px; background-color: ${data.datasets[0].backgroundColor[i]};"></span>
                ${label}
            `;
            legendContainer.appendChild(legendItem);
        });
    }

    // Handle remind button clicks - opens WhatsApp with template message
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remind-btn') || e.target.closest('.remind-btn')) {
            const button = e.target.classList.contains('remind-btn') ? e.target : e.target.closest('.remind-btn');
            const name = button.dataset.name;
            const phone = button.dataset.phone;
            
            const message = `Hi ${name}, this is a reminder to complete your TP assessment. ` +
                           `We're excited about your application! Please complete it at your earliest convenience.`;
            window.open(`https://wa.me/+6${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    });

    // Initialize translations
    updateTranslations();
    
    // Auto-focus phone input
    document.getElementById('dashboard-phone').focus();
    
    // Phone number validation - only numbers
    document.getElementById('dashboard-phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Show TnG terms modal
    const tngModal = new bootstrap.Modal(document.getElementById('tngModal'));
    document.querySelector('[data-bs-target="#tngModal"]').addEventListener('click', function() {
        tngModal.show();
    });
});

// Translations for all languages
const translations = {
    en: {
        pageLangLabel: "Choose Your Language:",
        dashboardTitle: "Referral Dashboard",
        dashboardSubtitle: "Enter your details to view your referral status",
        phoneLabel: "Phone Number:",
        phonePlaceholder: "Enter your phone number (01XXXXXXXX)",
        phoneError: "Please provide a valid phone number (01XXXXXXXX).",
        emailLabel: "Email Address:",
        emailPlaceholder: "Enter your email address",
        emailError: "Please provide a valid email address.",
        viewStatusBtn: "View Referral Status",
        backToRAF: "Back to Referral Form",
        yourReferralsTitle: "Your Referrals",
        backBtn: "Back",
        totalReferrals: "Total Referrals",
        hiredReferrals: "Hired",
        inProgress: "In Progress",
        statusDistribution: "Status Distribution",
        earningsTitle: "Your Earnings",
        earningsStage: "Stage",
        earningsAmount: "Amount (RM)",
        earningsCount: "Count",
        earningsTotal: "Total",
        remindFriendsTitle: "Remind Your Friends",
        remindFriendsText: "Help your friends complete their assessments to join Teleperformance!",
        remindBtn: "Send WhatsApp Reminder",
        tpGlobal: "TP Global",
        followMalaysia: "TP Malaysia",
        followThailand: "TP Thailand",
        noReferrals: "No referrals found with these details.",
        referralName: "Friend's Name",
        referralEmail: "Email",
        referralStage: "Stage",
        referralStatus: "Status",
        referralDate: "Application Date",
        referralDays: "Days in Stage",
        referralAction: "Action",
        statusReceived: "Application Received",
        statusAssessment: "Assessment Stage",
        statusTalent: "Interview Stage",
        statusOperations: "Final Review",
        statusProbation: "Hired (Probation)",
        statusPassed: "Hired (Confirmed)",
        statusFailed: "Not Selected",
        statusPreviouslyApplied: "Previously Applied (No Payment)",
        statusHiredConfirmed: "Hired (Confirmed)",
        statusHiredProbation: "Hired (Probation)",
        statusPreviouslyAppliedNoPayment: "Previously Applied (No Payment)",
        statusFinalReview: "Final Review",
        statusInterviewStage: "Interview Stage",
        statusAssessmentStage: "Assessment Stage",
        statusApplicationReceived: "Application Received",
        statusNotSelected: "Not Selected",
        paymentNote: "Payment Information",
        paymentTermsTitle: "Payment Terms & Conditions",
        paymentTermsText1: "Payments will be made to your TnG eWallet linked to your phone number.",
        paymentTermsText2: "The RM750 bonus will be paid only after your referred candidate successfully completes the 90-day probation period.",
        paymentTermsText3: "All payments are subject to verification and may take up to 30 days after probation completion.",
        closeBtn: "Close",
        questionsTitle: "Questions?",
        contactUsText: "Email us at:",
        statusAssessmentPassed: "Assessment Passed (RM50)",
        paymentTermsText2: "RM50 will be paid when candidate passes assessment. RM750 bonus will be paid only after your referred candidate successfully completes the 90-day probation period.",
        noRemindersNeeded: "All your friends are on track!",
        filteredViewLabel: "Simplified Status View"
    },
    ja: {
        pageLangLabel: "言語を選択:",
        dashboardTitle: "紹介ダッシュボード",
        dashboardSubtitle: "詳細を入力して紹介状況を表示",
        phoneLabel: "電話番号:",
        phonePlaceholder: "電話番号を入力 (01XXXXXXXX)",
        phoneError: "有効な電話番号を入力してください (01XXXXXXXX)",
        emailLabel: "メールアドレス:",
        emailPlaceholder: "メールアドレスを入力",
        emailError: "有効なメールアドレスを入力してください",
        viewStatusBtn: "紹介状況を表示",
        backToRAF: "紹介フォームに戻る",
        yourReferralsTitle: "あなたの紹介",
        backBtn: "戻る",
        totalReferrals: "総紹介数",
        hiredReferrals: "採用",
        inProgress: "進行中",
        statusDistribution: "ステータス分布",
        earningsTitle: "あなたの収益",
        earningsStage: "ステージ",
        earningsAmount: "金額 (RM)",
        earningsCount: "カウント",
        earningsTotal: "合計",
        remindFriendsTitle: "友達にリマインダーを送る",
        remindFriendsText: "友達が審査を完了できるようサポートしましょう！",
        remindBtn: "WhatsAppリマインダーを送る",
        tpGlobal: "TPグローバル",
        followMalaysia: "TPマレーシア",
        followThailand: "TPタイ",
        noReferrals: "該当する紹介は見つかりませんでした",
        referralName: "友達の名前",
        referralEmail: "メール",
        referralStage: "ステージ",
        referralStatus: "状態",
        referralDate: "申込日",
        referralDays: "ステージ日数",
        referralAction: "操作",
        statusReceived: "申込受付",
        statusAssessment: "審査ステージ",
        statusTalent: "面接ステージ",
        statusOperations: "最終レビュー",
        statusProbation: "採用（試用期間中）",
        statusPassed: "採用（確定）",
        statusFailed: "不採用",
        statusPreviouslyApplied: "以前に応募済み（支払い対象外）",
        statusHiredConfirmed: "採用（確定）",
        statusHiredProbation: "採用（試用期間中）",
        statusPreviouslyAppliedNoPayment: "以前に応募済み（支払い対象外）",
        statusFinalReview: "最終レビュー",
        statusInterviewStage: "面接ステージ",
        statusAssessmentStage: "審査ステージ",
        statusApplicationReceived: "申込受付",
        statusNotSelected: "不採用",
        paymentNote: "支払い情報",
        paymentTermsTitle: "支払い条件",
        paymentTermsText1: "支払いは登録された電話番号にリンクされたTnG電子財布に行われます。",
        paymentTermsText2: "RM750のボーナスは、紹介された候補者が90日の試用期間を無事に完了した後にのみ支払われます。",
        paymentTermsText3: "すべての支払いは確認が必要であり、試用期間完了後最大30日かかる場合があります。",
        closeBtn: "閉じる",
        questionsTitle: "質問がありますか？",
        contactUsText: "メールでお問い合わせ:",
        statusAssessmentPassed: "審査通過 (RM50)",
        paymentTermsText2: "候補者が審査を通過するとRM50が支払われます。RM750のボーナスは、紹介された候補者が90日の試用期間を無事に完了した後にのみ支払われます。",
        noRemindersNeeded: "すべての友達が順調です！",
        filteredViewLabel: "簡易ステータス表示"
    },
    ko: {
        pageLangLabel: "언어 선택:",
        dashboardTitle: "추천 대시보드",
        dashboardSubtitle: "추천 현황을 보려면 정보 입력",
        phoneLabel: "전화번호:",
        phonePlaceholder: "전화번호 입력 (01XXXXXXXX)",
        phoneError: "유효한 전화번호 입력 (01XXXXXXXX)",
        emailLabel: "이메일 주소:",
        emailPlaceholder: "이메일 주소 입력",
        emailError: "유효한 이메일 주소 입력",
        viewStatusBtn: "추천 현황 보기",
        backToRAF: "추천 양식으로 돌아가기",
        yourReferralsTitle: "귀하의 추천",
        backBtn: "뒤로",
        totalReferrals: "총 추천 수",
        hiredReferrals: "채용됨",
        inProgress: "진행 중",
        statusDistribution: "상태 분포",
        earningsTitle: "귀하의 수익",
        earningsStage: "단계",
        earningsAmount: "금액 (RM)",
        earningsCount: "카운트",
        earningsTotal: "합계",
        remindFriendsTitle: "친구들에게 알림 보내기",
        remindFriendsText: "친구들이 평가를 완료할 수 있도록 도와주세요!",
        remindBtn: "WhatsApp 알림 보내기",
        tpGlobal: "TP 글로벌",
        followMalaysia: "TP 말레이시아",
        followThailand: "TP 태국",
        noReferrals: "일치하는 추천 없음",
        referralName: "친구 이름",
        referralEmail: "이메일",
        referralStage: "단계",
        referralStatus: "상태",
        referralDate: "신청 날짜",
        referralDays: "단계 일수",
        referralAction: "조치",
        statusReceived: "신청서 접수",
        statusAssessment: "평가 단계",
        statusTalent: "면접 단계",
        statusOperations: "최종 검토",
        statusProbation: "채용 (수습 기간)",
        statusPassed: "채용 (확정)",
        statusFailed: "미채용",
        statusPreviouslyApplied: "이전 지원자 (지급 불가)",
        statusHiredConfirmed: "채용 (확정)",
        statusHiredProbation: "채용 (수습 기간)",
        statusPreviouslyAppliedNoPayment: "이전 지원자 (지급 불가)",
        statusFinalReview: "최종 검토",
        statusInterviewStage: "면접 단계",
        statusAssessmentStage: "평가 단계",
        statusApplicationReceived: "신청서 접수",
        statusNotSelected: "미채용",
        paymentNote: "결제 정보",
        paymentTermsTitle: "결제 조건",
        paymentTermsText1: "결제는 등록된 전화번호에 연결된 TnG 전자지갑으로 진행됩니다.",
        paymentTermsText2: "RM750 보너스는 추천한 후보자가 90일 수습 기간을 성공적으로 완료한 후에만 지급됩니다.",
        paymentTermsText3: "모든 결제는 확인이 필요하며 수습 기간 완료 후 최대 30일이 소요될 수 있습니다.",
        closeBtn: "닫기",
        questionsTitle: "질문이 있으신가요?",
        contactUsText: "이메일로 문의:",
        statusAssessmentPassed: "평가 통과 (RM50)",
        paymentTermsText2: "후보자가 평가를 통과하면 RM50이 지급됩니다。RM750 보너스는 추천한 후보자가 90일 수습 기간을 성공적으로 완료한 후에만 지급됩니다.",
        noRemindersNeeded: "모든 친구들이 순조롭게 진행 중입니다!",
        filteredViewLabel: "간략한 상태 보기"
    },
    "zh-CN": {
        pageLangLabel: "选择语言:",
        dashboardTitle: "推荐仪表板",
        dashboardSubtitle: "输入信息查看推荐状态",
        phoneLabel: "电话号码:",
        phonePlaceholder: "输入电话号码 (01XXXXXXXX)",
        phoneError: "请输入有效电话号码 (01XXXXXXXX)",
        emailLabel: "电子邮件:",
        emailPlaceholder: "输入电子邮件",
        emailError: "请输入有效电子邮件",
        viewStatusBtn: "查看推荐状态",
        backToRAF: "返回推荐表格",
        yourReferralsTitle: "您的推荐",
        backBtn: "返回",
        totalReferrals: "总推荐数",
        hiredReferrals: "已雇用",
        inProgress: "进行中",
        statusDistribution: "状态分布",
        earningsTitle: "您的收益",
        earningsStage: "阶段",
        earningsAmount: "金额 (RM)",
        earningsCount: "计数",
        earningsTotal: "总计",
        remindFriendsTitle: "提醒您的朋友",
        remindFriendsText: "帮助您的朋友完成评估加入Teleperformance！",
        remindBtn: "发送WhatsApp提醒",
        tpGlobal: "TP全球",
        followMalaysia: "TP马来西亚",
        followThailand: "TP泰国",
        noReferrals: "未找到匹配推荐",
        referralName: "朋友姓名",
        referralEmail: "电子邮件",
        referralStage: "阶段",
        referralStatus: "状态",
        referralDate: "申请日期",
        referralDays: "阶段天数",
        referralAction: "操作",
        statusReceived: "已收申请",
        statusAssessment: "评估阶段",
        statusTalent: "面试阶段",
        statusOperations: "最终审核",
        statusProbation: "雇用（试用期）",
        statusPassed: "雇用（确定）",
        statusFailed: "未通过",
        statusPreviouslyApplied: "之前申请过 (不支付)",
        statusHiredConfirmed: "雇用（确定）",
        statusHiredProbation: "雇用（试用期）",
        statusPreviouslyAppliedNoPayment: "之前申请过 (不支付)",
        statusFinalReview: "最终审核",
        statusInterviewStage: "面试阶段",
        statusAssessmentStage: "评估阶段",
        statusApplicationReceived: "已收申请",
        statusNotSelected: "未通过",
        paymentNote: "支付信息",
        paymentTermsTitle: "支付条款",
        paymentTermsText1: "款项将支付至与您电话号码关联的TnG电子钱包。",
        paymentTermsText2: "RM750奖金仅在您推荐的候选人成功完成90天试用期后支付。",
        paymentTermsText3: "所有付款需经核实，可能在试用期完成后最多30天内完成。",
        closeBtn: "关闭",
        questionsTitle: "有问题吗？",
        contactUsText: "发送邮件至:",
        statusAssessmentPassed: "评估通过 (RM50)",
        paymentTermsText2: "候选人通过评估后将支付RM50。RM750奖金仅在您推荐的候选人成功完成90天试用期后支付。",
        noRemindersNeeded: "您的朋友们都在正常进行中！",
        filteredViewLabel: "简化状态视图"
    },
    "zh-HK": {
        pageLangLabel: "選擇語言:",
        dashboardTitle: "推薦儀表板",
        dashboardSubtitle: "輸入信息查看推薦狀態",
        phoneLabel: "電話號碼:",
        phonePlaceholder: "輸入電話號碼 (01XXXXXXXX)",
        phoneError: "請輸入有效電話號碼 (01XXXXXXXX)",
        emailLabel: "電子郵件:",
        emailPlaceholder: "輸入電子郵件",
        emailError: "請輸入有效電子郵件",
        viewStatusBtn: "查看推薦狀態",
        backToRAF: "返回推薦表格",
        yourReferralsTitle: "您的推薦",
        backBtn: "返回",
        totalReferrals: "總推薦數",
        hiredReferrals: "已僱用",
        inProgress: "進行中",
        statusDistribution: "狀態分佈",
        earningsTitle: "您的收益",
        earningsStage: "階段",
        earningsAmount: "金額 (RM)",
        earningsCount: "計數",
        earningsTotal: "總計",
        remindFriendsTitle: "提醒您的朋友",
        remindFriendsText: "幫助您的朋友完成評估加入Teleperformance！",
        remindBtn: "發送WhatsApp提醒",
        tpGlobal: "TP全球",
        followMalaysia: "TP馬來西亞",
        followThailand: "TP泰國",
        noReferrals: "未找到匹配推薦",
        referralName: "朋友姓名",
        referralEmail: "電子郵件",
        referralStage: "階段",
        referralStatus: "狀態",
        referralDate: "申請日期",
        referralDays: "階段天數",
        referralAction: "操作",
        statusReceived: "已收申請",
        statusAssessment: "評估階段",
        statusTalent: "面試階段",
        statusOperations: "最終審核",
        statusProbation: "僱用（試用期）",
        statusPassed: "僱用（確定）",
        statusFailed: "未通過",
        statusPreviouslyApplied: "之前申請過 (不支付)",
        statusHiredConfirmed: "僱用（確定）",
        statusHiredProbation: "僱用（試用期）",
        statusPreviouslyAppliedNoPayment: "之前申請過 (不支付)",
        statusFinalReview: "最終審核",
        statusInterviewStage: "面試階段",
        statusAssessmentStage: "評估階段",
        statusApplicationReceived: "已收申請",
        statusNotSelected: "未通過",
        paymentNote: "支付信息",
        paymentTermsTitle: "支付條款",
        paymentTermsText1: "款項將支付至與您電話號碼關聯的TnG電子錢包。",
        paymentTermsText2: "RM750獎金僅在您推薦的候選人成功完成90天試用期後支付。",
        paymentTermsText3: "所有付款需經核實，可能在試用期完成後最多30天內完成。",
        closeBtn: "關閉",
        questionsTitle: "有問題嗎？",
        contactUsText: "發送郵件至:",
        statusAssessmentPassed: "評估通過 (RM50)",
        paymentTermsText2: "候選人通過評估後將支付RM50。RM750獎金僅在您推薦的候選人成功完成90天試用期後支付。",
        noRemindersNeeded: "您的朋友們都在正常進行中！",
        filteredViewLabel: "簡化狀態視圖"
    }
};

// Earnings structure
const earningsStructure = {
    assessment: {
        amount: 50,
        label: "Pass Assessment",
        description: "Paid when candidate passes assessment"
    },
    probation: { 
        amount: 750, 
        label: "Pass Probation (90 days)",
        description: "Paid only for new candidates who complete 90 days"
    }
};

// Sample data with all status examples
const sampleData = {
    "0123456789:amr@tp.com": [
        {
            name: "John Smith (Passed Probation)",
            email: "john.smith@example.com",
            stage: "Hired",
            status: "Successfully passed probation",
            statusType: "passed",
            applicationDate: "2023-11-15",
            hireDate: "2023-11-20",
            daysInStage: 95,
            category: "Customer Service",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345678",
            isPreviousCandidate: false
        },
        {
            name: "Sarah Johnson (In Probation)",
            email: "sarah.j@example.com",
            stage: "Hired",
            status: "In probation period",
            statusType: "probation",
            applicationDate: "2023-12-10",
            hireDate: "2023-12-15",
            daysInStage: 45,
            category: "Technical Support",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345679",
            isPreviousCandidate: false
        },
        {
            name: "Michael Brown (Operations Review)",
            email: "michael.b@example.com",
            stage: "Operations",
            status: "Final review by operations",
            statusType: "operations",
            applicationDate: "2024-01-05",
            hireDate: "",
            daysInStage: 10,
            category: "Sales",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345680",
            isPreviousCandidate: false
        },
        {
            name: "Loai (Interview Stage)",
            email: "loai.d@example.com",
            stage: "Talent",
            status: "Interview scheduled",
            statusType: "talent",
            applicationDate: "2024-01-15",
            hireDate: "",
            daysInStage: 5,
            category: "Customer Service",
            source: "Employee Referral",
            needsAction: true,
            phone: "0174669871",
            isPreviousCandidate: false
        },
        {
            name: "Tarek (Assessment)",
            email: "tarek@example.com",
            stage: "Assessment",
            status: "Assessment in progress",
            statusType: "assessment",
            applicationDate: "2024-01-20",
            hireDate: "",
            daysInStage: 2,
            category: "Technical Support",
            source: "Employee Referral",
            needsAction: true,
            phone: "0182708243",
            isPreviousCandidate: false
        },
        {
            name: "Pourya (Assessment)",
            email: "Pourya@example.com",
            stage: "Assessment",
            status: "Assessment in progress",
            statusType: "assessment",
            applicationDate: "2024-01-20",
            hireDate: "",
            daysInStage: 2,
            category: "Technical Support",
            source: "Employee Referral",
            needsAction: true,
            phone: "0173890590",
            isPreviousCandidate: false
        },
        {
            name: "Lisa Miller (Application Received)",
            email: "lisa.m@example.com",
            stage: "Application",
            status: "Application received",
            statusType: "received",
            applicationDate: "2024-01-25",
            hireDate: "",
            daysInStage: 1,
            category: "Sales",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345683",
            isPreviousCandidate: false
        },
        {
            name: "Robert Taylor (Not Selected)",
            email: "robert.t@example.com",
            stage: "Hired",
            status: "Terminated during probation",
            statusType: "failed",
            applicationDate: "2023-10-01",
            hireDate: "2023-10-10",
            daysInStage: 45,
            category: "Customer Service",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345684",
            isPreviousCandidate: false
        },
        {
            name: "Previous Candidate (No Payment)",
            email: "previous@example.com",
            stage: "Application",
            status: "Applied to TP before",
            statusType: "previouslyApplied",
            applicationDate: "2023-01-10",
            hireDate: "",
            daysInStage: 400,
            category: "Customer Service",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345685",
            isPreviousCandidate: true
        }
    ],
    "0174669871:loai@example.com": [
        {
            name: "Jane Doe (Assessment)",
            email: "jane.doe@example.com",
            stage: "Assessment",
            status: "Assessment in progress",
            statusType: "assessment",
            applicationDate: "2024-01-18",
            hireDate: "",
            daysInStage: 3,
            category: "Customer Service",
            source: "Employee Referral",
            needsAction: true,
            phone: "0112345686",
            isPreviousCandidate: false
        }
    ],
    "0182708243:tarek@example.com": [
        {
            name: "Mike Johnson (Probation)",
            email: "mike.j@example.com",
            stage: "Hired",
            status: "In probation period",
            statusType: "probation",
            applicationDate: "2023-12-05",
            hireDate: "2023-12-10",
            daysInStage: 60,
            category: "Technical Support",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345687",
            isPreviousCandidate: false
        }
    ],
    "0173890590:pourya@example.com": [
        {
            name: "Sarah Williams (Operations)",
            email: "sarah.w@example.com",
            stage: "Operations",
            status: "Final review by operations",
            statusType: "operations",
            applicationDate: "2024-01-10",
            hireDate: "",
            daysInStage: 15,
            category: "Sales",
            source: "Employee Referral",
            needsAction: false,
            phone: "0112345688",
            isPreviousCandidate: false
        }
    ]
};
