if (Utils.mobileAndTabletcheck()) new Background(document.querySelector('#bg'));
const searchResults = document.querySelector('#search-results');

const connection = new Utils.DataBaseConnection();
connection.promise().then(() => {
    Utils.DataBaseConnection.generateSearchResults(searchResults, connection.data);
})