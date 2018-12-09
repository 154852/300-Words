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
    const form = document.querySelector('form');

    form.children[1].value = document.querySelector('#title').innerText;
    form.children[2].value = document.querySelector('#summary').innerText;
    form.children[3].value = document.querySelector('#author span').innerText;
    form.children[4].value = document.querySelector('#tags').innerText.replace(/ /g, '-');
    form.children[5].value = document.querySelector('#title').innerText.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9]/g, '');
    form.children[6].value = document.querySelector('#main').innerText;

    if (form.children[1].value.length < 3 || form.children[1].value.length > 20) {
        alert('Title names cannot be less that 3 characters or more than 20.');
        return;
    }

    if (form.children[2].value.length < 20 || form.children[2].value.length > 150) {
        alert('Summaries cannot be less that 20 characters, or more than 150.');
        return;
    }

    if (form.children[3].value.length < 3 || form.children[3].value.length > 15) {
        alert('Author names cannot be less that 3 characters, or more than 15.');
        return;
    }
    
    const words = form.children[6].value.split(' ').length;
    if (words < 250 || words > 400) {
        alert('Word count must be between 250 and 400. Count: ' + words);
        return;
    }

    form.children[7].click();
});