       // JavaScript for basic interaction (optional for mock)

        // --- Section Switching Logic ---
        const navLinks = document.querySelectorAll('.nav-link');
        const contentSections = document.querySelectorAll('.content-section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior

                // Remove 'active' class from all links and sections
                navLinks.forEach(nav => nav.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                // Add 'active' class to the clicked link
                this.classList.add('active');

                // Get the target section ID from the data attribute
                const targetSectionId = this.dataset.section;
                const targetSection = document.getElementById(targetSectionId);

                // Add 'active' class to the target section
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });

        // --- Schedule Add Form Logic ---
        document.getElementById('add-schedule-form').addEventListener('submit', function(event) {
            event.preventDefault(); // フォームの送信をキャンセル

            // フォームからデータを取得
            const title = document.getElementById('title').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const members = document.getElementById('members').value;

            if (title && date) {
                // スケジュールリストに新しい項目を追加
                const scheduleList = document.getElementById('schedule-list');
                const newItem = document.createElement('div');
                newItem.classList.add('border-b', 'border-pink-100', 'py-3', 'last:border-b-0');
                newItem.innerHTML = `
                    <p class="text-gray-700">
                        <span class="font-semibold text-pink-500">${date} ${time ? time : ''}</span>
                         - ${title} ${members ? '(' + members + ')' : ''}
                    </p>
                `;
                scheduleList.appendChild(newItem);

                // フォームをリセット
                this.reset();

                // AI提案エリアに簡単なフィードバックを表示 (これはモックです)
                const aiSuggestionsContent = document.getElementById('ai-suggestions-content');
                const feedback = document.createElement('p');
                feedback.classList.add('text-blue-900', 'mb-3');
                feedback.textContent = `「「${title}」を予定に追加しました！素晴らしい計画ですね！✨」`;
                // 既存のフィードバックの上に新しいものを追加
                aiSuggestionsContent.insertBefore(feedback, aiSuggestionsContent.firstChild);

            } else {
                alert('タイトルと日付は必須です！'); // シンプルなアラート
            }
        });


        // --- Dummy Scheduling Logic (for Mockup) ---
        document.getElementById('find-available-times').addEventListener('click', function() {
            const selectedMembers = document.getElementById('scheduling-members').value;
            const selectedPeriod = document.getElementById('scheduling-period').value;
            const keyword = document.getElementById('scheduling-keyword').value;
            const suggestionsDiv = document.getElementById('scheduling-suggestions-content');

            // Clear previous suggestions
            suggestionsDiv.innerHTML = '';

            if (!selectedMembers || !selectedPeriod) {
                suggestionsDiv.innerHTML = '<p class="text-red-600">メンバーと期間を選択してください。</p>';
                return;
            }

            // --- Dummy AI Suggestion Generation ---
            // In a real app, you would send these parameters to your backend
            // which would use OpenAI API and calendar data to find actual slots.
            let suggestionText = `「${selectedPeriod}に`;
            if (selectedMembers === 'all') {
                suggestionText += `家族全員`;
            } else {
                // 選択されたメンバー名を適当に表示 (モックなので簡易的に)
                 const memberSelect = document.getElementById('scheduling-members');
                 const selectedOptionText = memberSelect.options[memberSelect.selectedIndex].text;
                 suggestionText += `${selectedOptionText}さん`;
                 if (selectedMembers !== 'all' && selectedMembers !== '') {
                     // 複数選択の場合のモック表現
                     if (Math.random() > 0.5) suggestionText += `と〇〇さん`;
                 }
            }
            suggestionText += `が空いている時間を見つけました。以下の候補日はいかがですか？✨」`;

            let suggestionListHtml = '<ul>';
            // ダミーの候補日をいくつか生成
            const today = new Date();
            for (let i = 0; i < 3; i++) {
                const candidateDate = new Date(today);
                candidateDate.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1); // 1～14日後のランダムな日付
                const month = candidateDate.getMonth() + 1;
                const day = candidateDate.getDate();
                const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][candidateDate.getDay()];
                const randomHour = Math.floor(Math.random() * 10) + 9; // 9時から18時の間の時間
                const randomMinute = Math.random() > 0.5 ? '00' : '30';
                const timeSlot = Math.random() > 0.7 ? '終日' : `${randomHour}:${randomMinute} - ${randomHour + 1}:${randomMinute}`;

                suggestionListHtml += `<li>${month}/${day} (${dayOfWeek}) ${timeSlot}</li>`;
            }
            suggestionListHtml += '</ul>';


            suggestionsDiv.innerHTML = `<p class="text-blue-900 mb-3">${suggestionText}</p>${suggestionListHtml}`;

             // 失敗パターンのモックも追加
             if (Math.random() < 0.3) { // 30%の確率で失敗パターンを表示
                 suggestionsDiv.innerHTML += `<p class="text-blue-900 mt-4">「残念ながら、選択された条件に合う空き時間が見つかりませんでした。別の期間やメンバーで探してみましょうか？🤔」</p>`;
             }

        });