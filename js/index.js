if (Utils.mobileAndTabletcheck()) new Background(document.querySelector('#bg'));

const search = document.querySelector('#search');
const main = document.querySelector('#main');
const searchResults = document.querySelector('#search-results');

const connection = new Utils.DataBaseConnection();

function update() {
    if (search.value.length > 2) {
        search.classList.add('content');
        searchResults.classList.add('active');

        if (connection.connected()) {
            searchResults.innerHTML = '';
            Utils.DataBaseConnection.generateSearchResults(searchResults, connection.search(search.value));
            background.setSize(background.getGraphicalSize());
        }
    } else {
        search.classList.remove('content');
        searchResults.classList.remove('active');
    }
}

let allow = false;
search.addEventListener('focus', function(event) {
    if (!Utils.mobileAndTabletcheck() && !allow) {
        search.blur();
        setTimeout(() => {
            search.focus();
            search.classList.remove('focused');
        }, 600);
        search.classList.add('focused');

        allow = true;
    } else allow = false;

    main.classList.add('other-focus');
    update();

    document.querySelector('#publish').css('opacity', '0');
    document.querySelector('#all').css('opacity', '0');
});

search.addEventListener('blur', function() {
    main.classList.remove('other-focus');

    search.classList.remove('focused');
    search.classList.remove('content');
    searchResults.classList.remove('active');

    document.querySelector('#publish').css('opacity', '1');
    document.querySelector('#all').css('opacity', '1');
});

search.addEventListener('input', update);