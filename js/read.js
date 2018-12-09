const searchPage = document.querySelector('#search-page');
const search = document.querySelector('#search');
const searchResults = document.querySelector('#search-results');

const connection = new Utils.DataBaseConnection();

connection.promise().then((value) => {
    const book = value.find(Utils.queryString('book'));
    document.querySelector('#title').innerText = book.title;
    document.querySelector('#main').innerHTML = Utils.MDtoHTML(book.content);
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