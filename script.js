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

            // 家族セクションが表示されたらメンバーリストを読み込み・表示
            if (targetSectionId === 'family') {
                const initialMembers = loadMembers();
                renderMembers(initialMembers);
                // フォームエリアを非表示に戻す
                hideMemberForm();
            }
            // 買い物リストセクションが表示されたらリストを読み込み・表示
            else if (targetSectionId === 'shopping-list') {
                 const initialShoppingList = loadShoppingList();
                 renderShoppingList(initialShoppingList);
                 // TODO: AIおすすめアイテムの表示処理を追加
            }
            // 家族ルールセクションが表示されたらリストを読み込み・表示
            else if (targetSectionId === 'family-rules') {
                 const initialRules = loadRules();
                 renderRules(initialRules);
                 // フォームエリアを非表示に戻す
                 hideRuleForm();
            }
            // TODO: 他のセクション表示時の初期化処理を追加
        }
    });
});

// --- Schedule Management with Local Storage ---

const scheduleList = document.getElementById('schedule-list');
const addScheduleForm = document.getElementById('add-schedule-form');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const membersInput = document.getElementById('members');
const addScheduleButton = addScheduleForm.querySelector('button[type="submit"]'); // フォームのsubmitボタンを取得

let editingScheduleId = null; // 編集中かどうか、および編集中の予定のIDを保持する変数

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

    // 編集ボタンにイベントリスナーを追加
    newItem.querySelector('.edit-schedule-btn').addEventListener('click', function() {
        // ボタンの親要素（予定アイテム全体）からスケジュールIDを取得
        const scheduleId = parseInt(this.closest('.border-b').dataset.scheduleId);
        // 編集モードを開始
        startEditingSchedule(scheduleId);
    });


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

    // 削除した予定が編集中のものだった場合、編集モードを終了
    if (editingScheduleId === id) {
        cancelEditing();
    }
}

// Function to start editing a schedule
function startEditingSchedule(id) {
    const schedules = loadSchedules();
    // 編集対象の予定をIDで検索
    const scheduleToEdit = schedules.find(schedule => schedule.id === id);

    if (scheduleToEdit) {
        // フォームに予定のデータを入力
        titleInput.value = scheduleToEdit.title;
        dateInput.value = scheduleToEdit.date;
        timeInput.value = scheduleToEdit.time;
        membersInput.value = scheduleToEdit.members;

        // ボタンのテキストを「更新する」に変更
        addScheduleButton.textContent = '更新する';
        // 編集中フラグとIDをセット
        editingScheduleId = id;

        // 必要であれば、編集モードであることを示すUIの変更（例：フォームの背景色を変えるなど）
        addScheduleForm.classList.add('editing'); // 仮のクラスを追加
    }
}

// Function to update an existing schedule
function updateSchedule(id, title, date, time, members) {
    const schedules = loadSchedules();
    // 更新対象の予定をIDで検索し、データを更新
    const scheduleIndex = schedules.findIndex(schedule => schedule.id === id);

    if (scheduleIndex !== -1) {
        schedules[scheduleIndex] = {
            id: id, // IDは変更しない
            title: title,
            date: date,
            time: time,
            members: members
        };
        // Local Storageに保存
        saveSchedules(schedules);
        // 画面に再描画
        renderSchedules(schedules);

        // 更新完了のフィードバック (任意)
        alert('予定を更新しました。');

        // 編集モードを終了
        cancelEditing();
    }
}

// Function to cancel editing mode
function cancelEditing() {
    // フォームをリセット
    addScheduleForm.reset();
    // ボタンのテキストを「追加する」に戻す
    addScheduleButton.textContent = '追加する';
    // 編集中フラグとIDをリセット
    editingScheduleId = null;
    // 編集モードを示すUIの変更を元に戻す
    addScheduleForm.classList.remove('editing'); // 仮のクラスを削除
}


// Event listener for the add/update schedule form submission
addScheduleForm.addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信をキャンセル

    const title = titleInput.value.trim(); // 前後の空白を削除
    const date = dateInput.value;
    const time = timeInput.value;
    const members = membersInput.value.trim(); // 前後の空白を削除

    if (title && date) { // タイトルと日付が入力されているかチェック
        if (editingScheduleId !== null) {
            // 編集中であれば更新処理を実行
            updateSchedule(editingScheduleId, title, date, time, members);
        } else {
            // 編集中でなければ追加処理を実行
            addSchedule(title, date, time, members);
        }

    } else {
        alert('タイトルと日付は必須です！'); // シンプルなアラート
    }
});

// Load and render schedules when the page is loaded
window.addEventListener('load', function() {
    // 初期表示はダッシュボードなので、予定を読み込み・表示
    const initialSchedules = loadSchedules();
    renderSchedules(initialSchedules);
    // TODO: 他のセクションの初期表示処理を追加
});


// --- Family Member Management with Local Storage ---

const memberList = document.getElementById('member-list');
const memberFormArea = document.getElementById('member-form-area');
const memberFormTitle = document.getElementById('member-form-title');
const memberForm = document.getElementById('member-form');
const memberIdInput = document.getElementById('member-id');
const memberNameInput = document.getElementById('member-name');
const memberBirthdayInput = document.getElementById('member-birthday');
const memberRelationInput = document.getElementById('member-relation');
const memberSchoolWorkInput = document.getElementById('member-school-work');
const memberHealthInput = document.getElementById('member-health');
const memberHobbiesInput = document.getElementById('member-hobbies');
const showAddMemberFormButton = document.getElementById('show-add-member-form');
const cancelMemberFormButton = document.getElementById('cancel-member-form');
// const deleteMemberButton = document.getElementById('delete-member-button'); // 削除ボタンは編集モード時に表示する想定

let editingMemberId = null; // 編集中かどうか、および編集中のメンバーのIDを保持する変数


// Function to create a member item HTML element
function createMemberItemElement(member) {
    const newItem = document.createElement('div');
    newItem.classList.add('member-item');
    // データ属性としてメンバーIDを保持させる
    newItem.dataset.memberId = member.id;

    newItem.innerHTML = `
        <div class="member-name">${member.name}</div>
        <div class="member-actions">
             <button class="btn-secondary edit-member-btn">編集</button>
             <button class="btn-danger delete-member-btn">削除</button>
        </div>
    `;

    // 削除ボタンにイベントリスナーを追加
    newItem.querySelector('.delete-member-btn').addEventListener('click', function() {
        const memberId = parseInt(this.closest('.member-item').dataset.memberId);
        deleteMember(memberId);
    });

    // 編集ボタンにイベントリスナーを追加
    newItem.querySelector('.edit-member-btn').addEventListener('click', function() {
        const memberId = parseInt(this.closest('.member-item').dataset.memberId);
        startEditingMember(memberId);
    });

    return newItem;
}

// Function to render members from an array
function renderMembers(members) {
    memberList.innerHTML = ''; // Clear current list
    members.forEach(member => {
        const itemElement = createMemberItemElement(member);
        memberList.appendChild(itemElement);
    });
}

// Function to save members to Local Storage
function saveMembers(members) {
    localStorage.setItem('familyLifePlannerMembers', JSON.stringify(members));
}

// Function to load members from Local Storage
function loadMembers() {
    const membersJson = localStorage.getItem('familyLifePlannerMembers');
    if (membersJson) {
        return JSON.parse(membersJson);
    }
    return []; // データがない場合は空の配列を返す
}

// Function to show the member form for adding
function showAddMemberForm() {
    memberFormArea.classList.add('active');
    memberFormTitle.textContent = '新しいメンバーを追加';
    memberForm.reset(); // フォームをクリア
    memberIdInput.value = ''; // 隠しフィールドもクリア
    editingMemberId = null; // 編集中IDをリセット
    // TODO: 削除ボタンを非表示にする
}

// Function to hide the member form
function hideMemberForm() {
    memberFormArea.classList.remove('active');
    cancelEditingMember(); // 編集モードを終了
}

// Function to add a new member
function addMember(name, birthday, relation, schoolWork, health, hobbies) {
    const members = loadMembers();
    const newMember = {
        id: Date.now(), // 簡単なユニークIDとしてタイムスタンプを使用
        name: name,
        birthday: birthday,
        relation: relation,
        schoolWork: schoolWork,
        health: health,
        hobbies: hobbies
    };
    members.push(newMember);
    saveMembers(members);
    renderMembers(members);

    alert('新しいメンバーを追加しました！');
    hideMemberForm(); // フォームを閉じる
}

// Function to delete a member
function deleteMember(id) {
    if (confirm('このメンバーを削除しますか？')) { // 削除確認
        let members = loadMembers();
        members = members.filter(member => member.id !== id);
        saveMembers(members);
        renderMembers(members);
        alert('メンバーを削除しました。');
        // 削除したメンバーが編集中のものだった場合、編集モードを終了
        if (editingMemberId === id) {
            cancelEditingMember();
        }
    }
}

// Function to start editing a member
function startEditingMember(id) {
    const members = loadMembers();
    const memberToEdit = members.find(member => member.id === id);

    if (memberToEdit) {
        // フォームにメンバーのデータを入力
        memberIdInput.value = memberToEdit.id; // IDもセット
        memberNameInput.value = memberToEdit.name;
        memberBirthdayInput.value = memberToEdit.birthday;
        memberRelationInput.value = memberToEdit.relation;
        memberSchoolWorkInput.value = memberToEdit.schoolWork;
        memberHealthInput.value = memberToEdit.health;
        memberHobbiesInput.value = memberToEdit.hobbies;

        memberFormTitle.textContent = `${memberToEdit.name}さんの情報を編集`;
        // TODO: 削除ボタンを表示する
        memberFormArea.classList.add('active'); // フォームを表示
        editingMemberId = id; // 編集中IDをセット
    }
}

// Function to update an existing member
function updateMember(id, name, birthday, relation, schoolWork, health, hobbies) {
    const members = loadMembers();
    const memberIndex = members.findIndex(member => member.id === id);

    if (memberIndex !== -1) {
        members[memberIndex] = {
            id: id, // IDは変更しない
            name: name,
            birthday: birthday,
            relation: relation,
            schoolWork: schoolWork,
            health: health,
            hobbies: hobbies
        };
        saveMembers(members);
        renderMembers(members);
        alert('メンバー情報を更新しました！');
        hideMemberForm(); // フォームを閉じる
    }
}

// Function to cancel editing mode for members
function cancelEditingMember() {
     memberForm.reset();
     memberIdInput.value = '';
     memberFormTitle.textContent = 'メンバー情報入力'; // タイトルを元に戻す
     // TODO: 削除ボタンを非表示にする
     memberFormArea.classList.remove('active'); // フォームを非表示
     editingMemberId = null; // 編集中IDをリセット
}


// Event listener for the add member form submission
memberForm.addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信をキャンセル

    const id = memberIdInput.value ? parseInt(memberIdInput.value) : null; // IDを取得 (新規の場合はnull)
    const name = memberNameInput.value.trim();
    const birthday = memberBirthdayInput.value;
    const relation = memberRelationInput.value;
    const schoolWork = memberSchoolWorkInput.value.trim();
    const health = memberHealthInput.value.trim();
    const hobbies = memberHobbiesInput.value.trim();

    if (name && relation) { // 名前と続柄は必須
        if (id) { // IDがあれば編集
            updateMember(id, name, birthday, relation, schoolWork, health, hobbies);
        } else { // IDがなければ新規追加
            addMember(name, birthday, relation, schoolWork, health, hobbies);
        }
    } else {
        alert('名前と続柄は必須です！');
    }
});

// Event listener for showing the add member form
showAddMemberFormButton.addEventListener('click', showAddMemberForm);

// Event listener for canceling the member form
cancelMemberFormButton.addEventListener('click', hideMemberForm);


// --- Shopping List Management with Local Storage ---

const shoppingListItemsDiv = document.getElementById('shopping-list-items');
const newShoppingItemInput = document.getElementById('new-shopping-item-input');
const addShoppingItemButton = document.getElementById('add-shopping-item-button');
// TODO: AIおすすめアイテム関連の要素も取得


// Function to create a shopping list item HTML element
function createShoppingListItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('shopping-list-item');
    // データ属性としてアイテムIDを保持させる
    itemDiv.dataset.itemId = item.id;
    // 購入済みならpurchasedクラスを追加
    if (item.purchased) {
        itemDiv.classList.add('purchased');
    }

    itemDiv.innerHTML = `
        <input type="checkbox" ${item.purchased ? 'checked' : ''}>
        <span>${item.name}</span>
        <div class="actions">
            <button class="delete-shopping-item-btn">削除</button>
        </div>
    `;

    // チェックボックスにイベントリスナーを追加（購入済みの切り替え）
    itemDiv.querySelector('input[type="checkbox"]').addEventListener('change', function() {
        const itemId = parseInt(this.closest('.shopping-list-item').dataset.itemId);
        toggleShoppingItemPurchased(itemId, this.checked);
    });

    // 削除ボタンにイベントリスナーを追加
    itemDiv.querySelector('.delete-shopping-item-btn').addEventListener('click', function() {
        const itemId = parseInt(this.closest('.shopping-list-item').dataset.itemId);
        deleteShoppingItem(itemId);
    });

    return itemDiv;
}

// Function to render shopping list items from an array
function renderShoppingList(items) {
    shoppingListItemsDiv.innerHTML = ''; // Clear current list
    // TODO: ソート順を検討（未購入を上に表示するなど）
    items.forEach(item => {
        const itemElement = createShoppingListItemElement(item);
        shoppingListItemsDiv.appendChild(itemElement);
    });
}

// Function to save shopping list to Local Storage
function saveShoppingList(items) {
    localStorage.setItem('familyLifePlannerShoppingList', JSON.stringify(items));
}

// Function to load shopping list from Local Storage
function loadShoppingList() {
    const shoppingListJson = localStorage.getItem('familyLifePlannerShoppingList');
    if (shoppingListJson) {
        return JSON.parse(shoppingListJson);
    }
    return []; // データがない場合は空の配列を返す
}

// Function to add a new shopping list item
function addShoppingItem(name) {
    const shoppingList = loadShoppingList();
    const newItem = {
        id: Date.now(), // 簡単なユニークID
        name: name,
        purchased: false // 初期状態は未購入
    };
    shoppingList.push(newItem);
    saveShoppingList(shoppingList);
    renderShoppingList(shoppingList);

    alert(`「${name}」を買い物リストに追加しました！`);
}

// Function to delete a shopping list item
function deleteShoppingItem(id) {
     if (confirm('このアイテムをリストから削除しますか？')) { // 削除確認
        let shoppingList = loadShoppingList();
        shoppingList = shoppingList.filter(item => item.id !== id);
        saveShoppingList(shoppingList);
        renderShoppingList(shoppingList);
        alert('アイテムを削除しました。');
     }
}

// Function to toggle shopping item purchased status
function toggleShoppingItemPurchased(id, isPurchased) {
    const shoppingList = loadShoppingList();
    const itemIndex = shoppingList.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        shoppingList[itemIndex].purchased = isPurchased; // 購入済みステータスを更新
        saveShoppingList(shoppingList);
        renderShoppingList(shoppingList); // 画面を再描画して打ち消し線を反映
        // TODO: 必要であれば購入完了などのフィードバック
    }
}


// Event listener for the add shopping item button
addShoppingItemButton.addEventListener('click', function() {
    const itemName = newShoppingItemInput.value.trim();
    if (itemName) {
        addShoppingItem(itemName); // アイテムを追加
        newShoppingItemInput.value = ''; // 入力フィールドをクリア
    } else {
        alert('アイテム名を入力してください。');
    }
});

// Allow adding item by pressing Enter key in the input field
newShoppingItemInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        addShoppingItemButton.click(); // Trigger the add button click
    }
});


// Load and render shopping list when the page is loaded (or section is activated)
// window.addEventListener('load', function() { ... }); // この処理はセクション切り替えロジックに移しました


// --- Family Rules Management with Local Storage ---

const ruleList = document.getElementById('rule-list');
const ruleFormArea = document.getElementById('rule-form-area');
const ruleFormTitle = document.getElementById('rule-form-title');
const ruleForm = document.getElementById('rule-form');
const ruleIdInput = document.getElementById('rule-id');
const ruleContentInput = document.getElementById('rule-content');
const ruleResponsibleMembersInput = document.getElementById('rule-responsible-members');
const ruleRewardInput = document.getElementById('rule-reward');
const showAddRuleFormButton = document.getElementById('show-add-rule-form');
const cancelRuleFormButton = document.getElementById('cancel-rule-form');
// TODO: 編集モード時の削除ボタンも必要


let editingRuleId = null; // 編集中かどうか、および編集中のルールのIDを保持する変数


// Function to create a rule item HTML element
function createRuleItemElement(rule) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('rule-item');
    // データ属性としてルールIDを保持させる
    itemDiv.dataset.ruleId = rule.id;

    // 今日の日付を取得 (YYYY-MM-DD形式)
    const today = new Date().toISOString().slice(0, 10);
    // 今日のスタンプ状態を取得
    const isStampedToday = rule.stamps && rule.stamps[today] === true;

    itemDiv.innerHTML = `
        <button class="stamp-button ${isStampedToday ? 'stamped' : ''}" data-rule-id="${rule.id}">🌟</button>
        <div class="rule-content">
            ${rule.content}
            ${rule.responsibleMembers ? `<span class="text-sm text-gray-500 ml-2">(${rule.responsibleMembers})</span>` : ''}
            ${rule.reward ? `<span class="text-sm text-purple-500 ml-2">✨ ${rule.reward}</span>` : ''}
        </div>
        <div class="rule-actions">
             <button class="edit-rule-btn">編集</button>
             <button class="delete-rule-btn">削除</button>
        </div>
    `;

    // スタンプボタンにイベントリスナーを追加
    itemDiv.querySelector('.stamp-button').addEventListener('click', function() {
        const ruleId = parseInt(this.dataset.ruleId); // ボタン自身のデータ属性からIDを取得
        toggleRuleStamp(ruleId);
    });

    // 削除ボタンにイベントリスナーを追加
    itemDiv.querySelector('.delete-rule-btn').addEventListener('click', function() {
        const ruleId = parseInt(this.closest('.rule-item').dataset.ruleId);
        deleteRule(ruleId);
    });

    // 編集ボタンにイベントリスナーを追加
    itemDiv.querySelector('.edit-rule-btn').addEventListener('click', function() {
        const ruleId = parseInt(this.closest('.rule-item').dataset.ruleId);
        startEditingRule(ruleId);
    });


    return itemDiv;
}

// Function to render rules from an array
function renderRules(rules) {
    ruleList.innerHTML = ''; // Clear current list
    // TODO: ソート順を検討
    rules.forEach(rule => {
        const itemElement = createRuleItemElement(rule);
        ruleList.appendChild(itemElement);
    });
}

// Function to save rules to Local Storage
function saveRules(rules) {
    localStorage.setItem('familyLifePlannerRules', JSON.stringify(rules));
}

// Function to load rules from Local Storage
function loadRules() {
    const rulesJson = localStorage.getItem('familyLifePlannerRules');
    if (rulesJson) {
        return JSON.parse(rulesJson);
    }
    return []; // データがない場合は空の配列を返す
}

// Function to show the rule form for adding
function showAddRuleForm() {
    ruleFormArea.classList.add('active');
    ruleFormTitle.textContent = '新しいルールを追加';
    ruleForm.reset(); // フォームをクリア
    ruleIdInput.value = ''; // 隠しフィールドもクリア
    editingRuleId = null; // 編集中IDをリセット
    // TODO: 編集モード時のUI調整（削除ボタン非表示など）
}

// Function to hide the rule form
function hideRuleForm() {
    ruleFormArea.classList.remove('active');
    cancelEditingRule(); // 編集モードを終了
}


// Function to add a new rule
function addRule(content, responsibleMembers, reward) {
    const rules = loadRules();
    const newRule = {
        id: Date.now(), // 簡単なユニークID
        content: content,
        responsibleMembers: responsibleMembers,
        reward: reward,
        stamps: {} // スタンプ情報を保持するオブジェクト
    };
    rules.push(newRule);
    saveRules(rules);
    renderRules(rules);

    alert('新しいルールを追加しました！');
    hideRuleForm(); // フォームを閉じる
}

// Function to delete a rule
function deleteRule(id) {
     if (confirm('このルールを削除しますか？')) { // 削除確認
        let rules = loadRules();
        rules = rules.filter(rule => rule.id !== id);
        saveRules(rules);
        renderRules(rules);
        alert('ルールを削除しました。');
        // 削除したルールが編集中のものだった場合、編集モードを終了
        if (editingRuleId === id) {
            cancelEditingRule();
        }
     }
}

// Function to start editing a rule
function startEditingRule(id) {
    const rules = loadRules();
    const ruleToEdit = rules.find(rule => rule.id === id);

    if (ruleToEdit) {
        // フォームにルールのデータを入力
        ruleIdInput.value = ruleToEdit.id; // IDもセット
        ruleContentInput.value = ruleToEdit.content;
        ruleResponsibleMembersInput.value = ruleToEdit.responsibleMembers;
        ruleRewardInput.value = ruleToEdit.reward;

        ruleFormTitle.textContent = `ルールの編集`; // タイトルを編集用に変更
        // TODO: 編集モード時のUI調整（削除ボタン表示など）
        ruleFormArea.classList.add('active'); // フォームを表示
        editingRuleId = id; // 編集中IDをセット
    }
}

// Function to update an existing rule
function updateRule(id, content, responsibleMembers, reward) {
    const rules = loadRules();
    const ruleIndex = rules.findIndex(rule => rule.id === id);

    if (ruleIndex !== -1) {
        // スタンプ情報は引き継ぐ
        const existingStamps = rules[ruleIndex].stamps || {};
        rules[ruleIndex] = {
            id: id, // IDは変更しない
            content: content,
            responsibleMembers: responsibleMembers,
            reward: reward,
            stamps: existingStamps // スタンプ情報を引き継ぐ
        };
        saveRules(rules);
        renderRules(rules);
        alert('ルールを更新しました！');
        hideRuleForm(); // フォームを閉じる
    }
}

// Function to cancel editing mode for rules
function cancelEditingRule() {
     ruleForm.reset();
     ruleIdInput.value = '';
     ruleFormTitle.textContent = '新しいルールを追加'; // タイトルを元に戻す
     // TODO: 編集モード時のUI調整を元に戻す
     ruleFormArea.classList.remove('active'); // フォームを非表示
     editingRuleId = null; // 編集中IDをリセット
}

// Function to toggle rule stamp for today
function toggleRuleStamp(id) {
    const rules = loadRules();
    const ruleIndex = rules.findIndex(rule => rule.id === id);

    if (ruleIndex !== -1) {
        const today = new Date().toISOString().slice(0, 10); // 今日の日付 (YYYY-MM-DD)
        const currentStamps = rules[ruleIndex].stamps || {}; // 現在のスタンプ情報

        if (currentStamps[today]) {
            // スタンプ済みなら削除
            delete currentStamps[today];
            alert('スタンプを取り消しました。');
        } else {
            // スタンプ済みでないなら追加
            currentStamps[today] = true;
            alert('スタンプを押しました！');
        }

        rules[ruleIndex].stamps = currentStamps; // スタンプ情報を更新
        saveRules(rules); // Local Storageに保存
        renderRules(rules); // 画面を再描画してスタンプ状態を反映
    }
}


// Event listener for the add/update rule form submission
ruleForm.addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信をキャンセル

    const id = ruleIdInput.value ? parseInt(ruleIdInput.value) : null; // IDを取得 (新規の場合はnull)
    const content = ruleContentInput.value.trim();
    const responsibleMembers = ruleResponsibleMembersInput.value.trim();
    const reward = ruleRewardInput.value.trim();

    if (content) { // ルール内容は必須
        if (id) { // IDがあれば編集
            updateRule(id, content, responsibleMembers, reward);
        } else { // IDがなければ新規追加
            addRule(content, responsibleMembers, reward);
        }
    } else {
        alert('ルール内容は必須です！');
    }
});

// Event listener for showing the add rule form
showAddRuleFormButton.addEventListener('click', showAddRuleForm);

// Event listener for canceling the rule form
cancelRuleFormButton.addEventListener('click', hideRuleForm);


// Load and render schedules when the page is loaded
window.addEventListener('load', function() {
    // 初期表示はダッシュボードなので、予定を読み込み・表示
    const initialSchedules = loadSchedules();
    renderSchedules(initialSchedules);
    // TODO: 他のセクションの初期表示処理を追加
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



