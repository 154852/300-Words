String.prototype.replaceRegex = function(regex, replacement) {
    let newString = this;

    let m;
    do {
        m = regex.exec(this);
        if (m != null) {            
            let replacementString = replacement;
            for (let i = 0; i < m.length; i++) {
                replacementString = replacementString.split('$' + i).join(m[i]);
            }

            newString = newString.replace(m[0], replacementString);
        }
    } while (m != null);

    return newString;
}

function MDtoHTML(string) {
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\t/g, '    ');

    string = string.replaceRegex(/\/(^ [^\/]+^ )\//g, '<em>$1</em>');
    string = string.replaceRegex(/\*(^ [^*]+^ )\*/g, '<b>$1</b>');
    string = string.replaceRegex(/_(^ [^_]+^ )_/g, '<u>$1</u>');

    string = string.replaceRegex(/^---$/gm, '<br /><div class="hr"></div>');
    string = string.replaceRegex(/-(^ [^\-]+^ )-/g, '<del>$1</del>');

    string = string.replaceRegex(/###(.+)$\n/gm, '<h3>$1</h3>');
    string = string.replaceRegex(/##(.+)$\n/gm, '<h2>$1</h2>');
    string = string.replaceRegex(/#(.+)$\n/gm, '<h1>$1</h1>');

    string = string.replaceRegex(/^\+(.*)$\n/gm, '<li>$1</li>');

    string = string.replaceRegex(/\(([^)]+)\)\[([^\]]+)\]/g, '<a href="$2">$1</a>');

    string = string.replaceRegex(/```([^`]+)```/g, '<div class="code">$1</div>');
    string = string.replaceRegex(/`([^`]+)`/g, '<code>$1</code>');

    string = string.replaceRegex(/::([^:]+)::/gm, '<span class="highlight">$1</span>');

    return string.replace(/\n/g, '<br>');
}

const input = document.querySelector('#main');
const cover = document.querySelector('#preview-cover');
const coverContent = document.querySelector('#preview-cover > div');
const previewButton = document.querySelector('#preview');

input.addEventListener('keydown', function(event) {
    if (event.keyCode == 9) {
        event.preventDefault();
    }
})

document.body.addEventListener('click', function(event) {
    if (!cover.classList.contains('hidden') && event.target != previewButton)
        cover.classList.add('hidden');
});

const revert = (text, revertStr) => text == ''? revertStr:text;

previewButton.addEventListener('click', function() {
    if (cover.classList.contains('hidden')) {
        cover.classList.remove('hidden');

        coverContent.querySelector('h1').innerText = revert(document.querySelector('#title').innerText, 'Your title');
        coverContent.querySelector('p').innerText = 'Written by ' + revert(document.querySelector('#author span').innerText, 'an author');
        coverContent.querySelectorAll('div')[1].innerHTML = MDtoHTML(revert(document.querySelector('#main').innerText, 'Something'));
    } else {
        cover.classList.add('hidden');
    }
})

document.querySelector('#publish').addEventListener('click', function() {
    Utils.genForm({
        title: document.querySelector('#title').innerText,
        summary: coverContent.querySelector('#summary').innerText,
        author: document.querySelector('#author span').innerText,
        tags: coverContent.querySelector('#tags').replace(/ /g, '-').split(','),
        id: document.querySelector('#title').innerText.toLowerCase().replace(/-/g, '_').replace(/[^a-z0-9]/g, ''),
        content: document.querySelector('#main').innerText
    }).submit();
});