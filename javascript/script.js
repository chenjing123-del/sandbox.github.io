document.addEventListener('DOMContentLoaded', function () {
    const sandbox = document.getElementById('sandbox');
    const sidebar = document.getElementById('sidebar');
    const categorySelect = document.getElementById('category-select');

    // 分类数据
    const categories = {
        人物: [
          {type: '家庭成员', emoji: '👨‍👩‍👧‍👦'},
{ type: '老师', emoji: '👩🏻‍🏫' },
{ type: '医生', emoji: '👨🏻‍⚕' },
{ type: '圣诞老人', emoji: '🎅🏻' },
{ type: '卡通及故事人物 ', emoji: '🦸‍♂' },
{ type: '公主', emoji: '👩' },
{ type: '王子', emoji: '🤴' }
        ],
        动物: [
            { type: '野兽', emoji: '🦁' },
            { type: '家禽家畜', emoji: '🐔' },
            { type: '昆虫', emoji: '🦋' }
        ],
        植物: [
            { type: '花草', emoji: '🌹' },
            { type: '树木', emoji: '🌲' },
            { type: '蔬菜', emoji: '🥕' }
        ],
        建筑: [
            { type: '房屋', emoji: '🏠' },
            { type: '学校', emoji: '🏫' }
        ],
        工具: [
            { type: '陆地交通工具', emoji: '🚗' },
            { type: '水上交通工具', emoji: '🚤' },
            { type: '家具', emoji: '🛋️' }
        ],
        自然景观: [
            { type: '星星', emoji: '⭐' },
            { type: '月亮', emoji: '🌙' },
            { type: '太阳', emoji: '☀️' }
        ]
    };

    // 初始化侧边栏
    function updateSidebar(category) {
        sidebar.innerHTML = ''; // 清空侧边栏
        categories[category].forEach(item => {
            const div = document.createElement('div');
            div.className = 'item';
            div.draggable = true;
            div.dataset.type = item.type;
            div.textContent = item.emoji;
            sidebar.appendChild(div);
        });
    }

    // 默认加载人物分类
    updateSidebar('人物');

    // 分类切换事件
    categorySelect.addEventListener('change', function (e) {
        updateSidebar(e.target.value);
    });

    // 拖拽开始事件
    sidebar.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.type); // 传递物件的类型
            e.target.classList.add('dragging'); // 添加拖拽样式
        }
    });

    sidebar.addEventListener('dragend', function (e) {
        if (e.target.classList.contains('item')) {
            e.target.classList.remove('dragging'); // 移除拖拽样式
        }
    });

    // 拖拽进入沙盘区域事件
    sandbox.addEventListener('dragover', function (e) {
        e.preventDefault(); // 允许拖放
    });

    // 拖拽放置事件
    sandbox.addEventListener('drop', function (e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain'); // 获取物件的类型
        const offsetX = e.offsetX; // 鼠标在沙盘中的X坐标
        const offsetY = e.offsetY; // 鼠标在沙盘中的Y坐标

        // 创建新的物件元素
        const newItem = document.createElement('div');
        newItem.className = 'sandbox-item';
        newItem.textContent = getItemEmoji(type); // 设置物件的图标
        newItem.style.position = 'absolute';
        newItem.style.left = `${offsetX}px`;
        newItem.style.top = `${offsetY}px`;
        newItem.dataset.type = type;

        // 将物件添加到沙盘中
        sandbox.appendChild(newItem);
        saveSandbox(); // 保存沙盘状态
    });

    // 右键删除物件
    sandbox.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // 阻止默认右键菜单
        if (e.target.classList.contains('sandbox-item')) {
            e.target.remove(); // 删除物件
            saveSandbox(); // 更新沙盘状态
        }
    });

    // 滚轮缩放物件
    sandbox.addEventListener('wheel', function (e) {
        if (e.target.classList.contains('sandbox-item')) {
            e.preventDefault(); // 阻止页面滚动
            const scaleFactor = 1.1; // 缩放比例
            let currentScale = parseFloat(e.target.style.transform.replace('scale(', '').replace(')', '')) || 1;

            if (e.deltaY < 0) {
                // 向上滚动，放大
                currentScale *= scaleFactor;
            } else {
                // 向下滚动，缩小
                currentScale /= scaleFactor;
            }

            e.target.style.transform = `scale(${currentScale})`;
        }
    });
    let isDragging = false; // 是否正在拖拽
    let currentItem = null; // 当前拖拽的物件
    let offsetX, offsetY; // 鼠标与物件的偏移量

    // 鼠标按下事件
    sandbox.addEventListener('mousedown', function (e) {
        if (e.button === 0 && e.target.classList.contains('sandbox-item')) { // 左键按下且目标是沙盘物件
            isDragging = true;
            currentItem = e.target;

            // 计算鼠标与物件的偏移量
            const rect = currentItem.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // 添加拖拽样式
            currentItem.classList.add('dragging');
        }
    });

    // 鼠标移动事件
    sandbox.addEventListener('mousemove', function (e) {
        if (isDragging && currentItem) {
            e.preventDefault();

            // 计算物件的新的位置
            const sandboxRect = sandbox.getBoundingClientRect();
            const newX = e.clientX - sandboxRect.left - offsetX;
            const newY = e.clientY - sandboxRect.top - offsetY;

            // 限制物件的移动范围在沙盘内
            const maxX = sandboxRect.width - currentItem.offsetWidth;
            const maxY = sandboxRect.height - currentItem.offsetHeight;

            currentItem.style.left = `${Math.min(Math.max(newX, 0), maxX)}px`;
            currentItem.style.top = `${Math.min(Math.max(newY, 0), maxY)}px`;
        }
    });

    // 鼠标松开事件
    sandbox.addEventListener('mouseup', function (e) {
        if (isDragging && currentItem) {
            isDragging = false;
            currentItem.classList.remove('dragging'); // 移除拖拽样式
            currentItem = null;
            saveSandbox(); // 保存沙盘状态
        }
    });

    // 鼠标离开沙盘区域时停止拖拽
    sandbox.addEventListener('mouseleave', function () {
        if (isDragging && currentItem) {
            isDragging = false;
            currentItem.classList.remove('dragging');
            currentItem = null;
        }
    });
    // 根据类型返回对应的图标
    function getItemEmoji(type) {
        for (const category in categories) {
            const item = categories[category].find(i => i.type === type);
            if (item) return item.emoji;
        }
        return '❓';
    }

    // 保存沙盘状态
    function saveSandbox() {
        const items = [];
        document.querySelectorAll('.sandbox-item').forEach(item => {
            items.push({
                type: item.dataset.type,
                x: item.style.left,
                y: item.style.top,
                scale: item.style.transform || 'scale(1)'
            });
        });
        localStorage.setItem('sandbox', JSON.stringify(items));
    }

    // 加载沙盘状态
    function loadSandbox() {
        const savedItems = JSON.parse(localStorage.getItem('sandbox')) || [];
        savedItems.forEach(item => {
            const newItem = document.createElement('div');
            newItem.className = 'sandbox-item';
            newItem.textContent = getItemEmoji(item.type);
            newItem.style.position = 'absolute';
            newItem.style.left = item.x;
            newItem.style.top = item.y;
            newItem.style.transform = item.scale;
            newItem.dataset.type = item.type;
            sandbox.appendChild(newItem);
        });
    }

    // 页面加载时恢复沙盘状态
    loadSandbox();
});
