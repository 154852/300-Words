const cardWheel = document.querySelector('#cards');
let card = 0;

const left = document.querySelector('#arrow-left');
const right = document.querySelector('#arrow-right');

function update() {
    if (Utils.mobileAndTabletcheck()) {
        try {
            cardWheel.children[card].querySelector('.input').focus({preventScroll: true});
        } catch (ignore) {}
    }
    cardWheel.css('left', (card * -100) + 'vw');

    if (card == 0) {
        left.classList.add('grey');
    } else {
        left.classList.remove('grey');
    }

    if (card == cardWheel.children.length - 1) {
        right.classList.add('grey');
    } else {
        right.classList.remove('grey');
    }
}
update();

cardWheel.addEventListener('keydown', function(event) {
    if ((event.keyCode == 13 && card != 3) || event.keyCode == 9) {
        event.preventDefault();
        next();
    }
})

left.addEventListener('click', () => {
    card -= 1;
    update();
});

const next = () => {
    card += 1;
    update();
};
right.addEventListener('click', next);

const content = document.querySelector('p[name=content]');
const md = document.querySelector('#md-html');
content.addEventListener('input', function() {
    md.innerHTML = Utils.MDtoHTML(content.innerText);
})

const warn = (title, text) => {
    const element = document.querySelector('#alert');
    element.querySelector('h2').innerText = title;
    element.querySelector('p').innerText = text;
    element.classList.remove('hidden');
}

document.querySelector('#alert .button').addEventListener('click', function() {
    document.querySelector('#alert').classList.add('hidden');
})

document.querySelector('#publish').addEventListener('click', function() {
    const data = {
        title: document.querySelector('*[name=title]').innerText,
        summary: document.querySelector('*[name=summary]').innerText,
        author: document.querySelector('*[name=author]').innerText,
        tags: document.querySelector('*[name=tags]').innerText.replace(/ /g, '-').replace(/-,/g, ',').replace(/,-/g, ','),
        content: document.querySelector('*[name=content]').innerText
    };
    data.id = data.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9]/g, '')

    if (data.title.length < 3 || data.title.length > 40) {
        warn('Title is the wrong size...', 'Title names cannot be shorter than 3 characters or more than 40. Your current length is ' + data.title.length);
        return;
    }

    if (data.summary.length < 20 || data.summary.length > 150) {
        warn('Summary is the wrong size...', 'Summaries cannot be shorter than 20 characters or more than 150. Your current length is ' + data.summary.length);
        return;
    }

    if (data.author.length < 3 || data.author.length > 15) {
        warn('Author name is the wrong size...', 'Author names cannot be shorter than 3 characters or more than 15. Your current length is ' + data.author.length);
        return;
    }
    
    const words = data.content.split(' ').length;
    if (words < 100 || words > 600) {
        warn('Content is the wrong size...', 'Your content cannot be shorter than 250 words or more than 400. Your current count is ' + words);
        return;
    }

    if (localStorage.sent != null) {
        const obj = JSON.parse(localStorage.sent);
        obj.push(data);
        localStorage.sent = JSON.stringify(obj);
    } else {
        localStorage.sent = JSON.stringify([data]);
    }

    if (window.location.host.indexOf('netlify') != -1) {
        const form = document.querySelector('form');

        form.children[1].value = data.title;
        form.children[2].value = data.summary;
        form.children[3].value = data.author;
        form.children[4].value = data.tags;
        form.children[5].value = data.id;
        form.children[6].value = data.content;

        form.children[7].click();
    } else {
        window.open('mailto:louisemileploix@icloud.com?subject=Publish: ' + encodeURIComponent(data.title) + '&body=' + encodeURIComponent(JSON.stringify(data)), '_top');
        setTimeout(() => window.open('confirm.html', '_self'), 1000);
    }
})

new Background(document.querySelector('#bg'));
