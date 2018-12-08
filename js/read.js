
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
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    string = string.replaceRegex(/\/([^\/]+)\//g, '<em>$1</em>');
    string = string.replaceRegex(/\*([^*]+)\*/g, '<b>$1</b>');
    string = string.replaceRegex(/_([^_]+)_/g, '<u>$1</u>');

    string = string.replaceRegex(/^---$/gm, '<br /><div class="hr"></div>');
    string = string.replaceRegex(/-([^\-]+)-/g, '<del>$1</del>');

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

const searchPage = document.querySelector('#search-page');
const search = document.querySelector('#search');
const searchResults = document.querySelector('#search-results');

const connection = new Utils.DataBaseConnection();

connection.promise().then((value) => {
    const book = value.find(Utils.queryString('book'));
    document.querySelector('#title').innerText = book.title;
    document.querySelector('#main').innerHTML = MDtoHTML(book.content);
    document.querySelector('#author').innerText = 'Written by ' + book.author;
    document.title = book.title + ' | ' + document.title;
});

function update() {
    if (search.value.length > 2) {
        search.classList.add('content');
        searchResults.classList.add('active');

        if (connection.connected()) {
            searchResults.innerHTML = '';
            Utils.DataBaseConnection.generateSearchResults(searchResults, connection.search(search.value));
        }
    } else {
        search.classList.remove('content');
        searchResults.classList.remove('active');
    }
}

search.addEventListener('focus', function() {
    update();
});

search.addEventListener('blur', function() {
    search.classList.remove('content');
    searchResults.classList.remove('active');
    toggle(true);
});

search.addEventListener('input', update);

function toggle(force) {
    if (searchPage.classList.contains('hidden') || (force == false)) searchPage.classList.remove('hidden');
    else searchPage.classList.add('hidden');
}

document.querySelector('#search-toggle').addEventListener('click', () => toggle());