// JavaScript for Family Life Planner

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

// --- Schedule Management with Local Storage ---

const scheduleList = document.getElementById('schedule-list');
const addScheduleForm = document.getElementById('add-schedule-form');

// Function to create a schedule item HTML element
function createScheduleItemElement(schedule) {
    const newItem = document.createElement('div');
    newItem.classList.add('border-b', 'border-pink-100', 'py-3', 'last:border-b-0');
    // データ属性としてスケジュールIDを保持させる
    newItem.dataset.scheduleId = schedule.id;

    newItem.innerHTML = `
        <p class="text-gray-700">
            <span class="font-semibold text-pink-500">${schedule.date} ${schedule.time ? schedule.time : ''}</span>
             - ${schedule.title} ${schedule.members ? '(' + schedule.members + ')' : ''}
        </p>
        <div class="schedule-actions text-right text-sm mt-1">
             <button class="text-blue-500 hover:underline mr-2 edit-schedule-btn">編集</button>
             <button class="text-red-500 hover:underline delete-schedule-btn">削除</button>
        </div>
    `;

    // 削除ボタンにイベントリスナーを追加
    newItem.querySelector('.delete-schedule-btn').addEventListener('click', function() {
        // ボタンの親要素（予定アイテム全体）からスケジュールIDを取得
        const scheduleId = parseInt(this.closest('.border-b').dataset.scheduleId);
        // 削除処理を実行
        deleteSchedule(scheduleId);
    });

    // TODO: 編集ボタンにイベントリスナーを追加する

    return newItem;
}

// Function to render schedules from an array
function renderSchedules(schedules) {
    scheduleList.innerHTML = ''; // Clear current list
    // 予定を日付順にソート (任意)
    schedules.sort((a, b) => new Date(a.date) - new Date(b.date));
    schedules.forEach(schedule => {
        const itemElement = createScheduleItemElement(schedule);
        scheduleList.appendChild(itemElement);
    });
}

// Function to save schedules to Local Storage
function saveSchedules(schedules) {
    localStorage.setItem('familyLifePlannerSchedules', JSON.stringify(schedules));
}

// Function to load schedules from Local Storage
function loadSchedules() {
    const schedulesJson = localStorage.getItem('familyLifePlannerSchedules');
    if (schedulesJson) {
        return JSON.parse(schedulesJson);
    }
    return []; // データがない場合は空の配列を返す
}

// Function to add a new schedule
function addSchedule(title, date, time, members) {
    const schedules = loadSchedules();
    const newSchedule = {
        id: Date.now(), // 簡単なユニークIDとしてタイムスタンプを使用
        title: title,
        date: date,
        time: time,
        members: members
    };
    schedules.push(newSchedule);
    saveSchedules(schedules);
    renderSchedules(schedules);

    // AI提案エリアに簡単なフィードバックを表示 (これはモックです)
    const aiSuggestionsContent = document.getElementById('ai-suggestions-content');
    const feedback = document.createElement('p');
    feedback.classList.add('text-blue-900', 'mb-3');
    feedback.textContent = `「「${title}」を予定に追加しました！素晴らしい計画ですね！✨」`;
    aiSuggestionsContent.insertBefore(feedback, aiSuggestionsContent.firstChild);
}

// Function to delete a schedule
function deleteSchedule(id) {
    // 現在のスケジュールリストを読み込む
    let schedules = loadSchedules();
    // 削除対象のID以外の予定で新しい配列を作成
    schedules = schedules.filter(schedule => schedule.id !== id);
    // Local Storageに保存
    saveSchedules(schedules);
    // 画面に再描画
    renderSchedules(schedules);

    // 削除完了のフィードバック (任意)
    alert('予定を削除しました。');
}


// Event listener for the add schedule form submission
addScheduleForm.addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信をキャンセル

    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const membersInput = document.getElementById('members');

    const title = titleInput.value.trim(); // 前後の空白を削除
    const date = dateInput.value;
    const time = timeInput.value;
    const members = membersInput.value.trim(); // 前後の空白を削除

    if (title && date) { // タイトルと日付が入力されているかチェック
        addSchedule(title, date, time, members); // スケジュールを追加

        // フォームをリセット
        addScheduleForm.reset();

    } else {
        alert('タイトルと日付は必須です！'); // シンプルなアラート
    }
});

// Load and render schedules when the page is loaded
window.addEventListener('load', function() {
    const initialSchedules = loadSchedules();
    renderSchedules(initialSchedules);
});


// --- Dummy Scheduling Logic (for Mockup) ---
// この部分は前回のモックアップのままですが、必要に応じてscript.jsに移動・整理してください
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

