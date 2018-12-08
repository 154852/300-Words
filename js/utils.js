const Utils = {};

Utils.typeTo = function(object, key, text, speed) {
    for (let i = 0; i < text.length + 1; i++) {
        const index = i;
        setTimeout(() => {
            object[key] = text.slice(0, index);
        }, speed * i);
    }
}

Utils.DataBaseConnection = class {
    constructor() {
        const that = this;
        this.data = [];
        this.fuse = null;

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            that.data = JSON.parse(this.responseText);
            that.createSearchIndex();
        };
        xhr.open('GET', 'app/db.json');
        xhr.send();
    }

    promise() {
        const that = this;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (that.connected()) {
                    window.clearInterval(interval);
                    resolve(that);
                }
            }, 100);
        })
    }

    createSearchIndex() {
        if (window.Fuse) {
            this.fuse = new Fuse(this.data, {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [
                    {
                        name: 'title',
                        weight: 1
                    },
                    {
                        name: 'summary',
                        weight: 0.3
                    },
                    {
                        name: 'title',
                        weight: 0.8
                    },
                    {
                        name: 'author',
                        weight: 0.6
                    }
                ]
            });
        } else this.fuse = true;
    }

    connected() {
        return this.fuse != null;
    }

    search(query) {
        return this.fuse.search(query);
    }

    find(id) {
        for (const text of this.data) {
            if (text.id == id) return text;
        }

        return null;
    }
}
Utils.DataBaseConnection.generateSearchResults = function(element, results) {
    for (const result of results) {
        Utils.createElement('a', {
            class: 'search-result',
            listeners: {
                mousedown: () => {
                    window.open('read.html?book=' + result.id, '_self');
                }
            },
            parent: element,
            children: [
                Utils.createElement('div', {
                    class: 'search-result-inner',
                    children: [
                        Utils.createElement('h1', {
                            text: result.title
                        }),
                        Utils.createElement('p', {
                            text: ' - ' + result.summary
                        }),
                        Utils.createElement('span', {
                            text: ' - Written by ' + result.author,
                            css: {
                                'font-weight': '500'
                            }
                        })
                    ]
                })
            ]
        });
    }
}

Utils.css = function(element, name, value) {
    var rules = {};
    if (element.hasAttribute('style')) {
        var style = element.getAttribute('style');
        if (!style.endsWith(';')) style += ';';

        const regex = /([a-zA-Z\-0-9]*) ?: ?([^;^:]+);/g;

        var match;
        do {
            match = regex.exec(style);

            if (match != null) {
                rules[match[1]] = match[2];
            }
        } while (match != null);
    }

    rules[name] = value;

    var string = '';
    for (const rule in rules) {
        string += rule + ':' + rules[rule] + ';';
    }

    element.setAttribute('style', string);
}

Element.prototype.css = function(name, value) {
    Utils.css(this, name, value);
}

Utils.createElement = function(type, data, callback) {
    const element = document.createElement(type);

    if (data == null) return element;

    if ('html' in data) {
        element.innerHTML = data.html;
    }

    if ('text' in data) {
        element.innerHTML = data.text;
    }

    if ('parent' in data) {
        data.parent.appendChild(element);
    }

    if ('children' in data) {
        if (data.children.constructor.name == 'Array') {
            for (const child of data.children) element.appendChild(child)
        } else element.appendChild(data.children);
    }

    if ('class' in data) {
        if (data['class'].constructor.name == 'Array') {
            for (const className of data['class']) element.classList.add(className)
        } else element.className = data['class'];
    }

    if ('attr' in data) {
        for (const key in data.attr) {
            element.setAttribute(key, data.attr[key]);
        }
    }

    if ('listeners' in data) {
        for (const item in data.listeners) {
            element.addEventListener(item, data.listeners[item]);
        }
    }

    if ('css' in data) {
        var string = '';
        for (const item in data.css) {
            string += item + ':' + data.css[item] + ';';
        }
        element.setAttribute('style', (element.hasAttribute('style')? element.getAttribute('style'):'') + string);
    }

    if (callback != null) callback.call(element);

    return element;
}

Utils.queryString = function(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

Utils.genForm = function(data, method, path, netlify) {
    const form = document.createElement('form');

    for (let key in data) {
        const element = document.createElement('input');
        element.value = data[key].value;
        element.type = data[key].type;
        element.name = key;
        
        form.appendChild(element);
    }

    if (netlify) form.setAttribute('netlify', '');

    form.method = method;
    form.action = path;

    form.css('display', 'none');
    document.addEventListener(form);

    return form;
};