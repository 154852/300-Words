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
                threshold: 0.4,
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
                    window.open('read.html#' + result.id, '_self');
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

Utils.MDtoHTML = function(string) {
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\t/g, '');

    string = string.replaceRegex(/\/([^ ][^\/]*[^ ])\//g, '<em>$1</em>');
    string = string.replaceRegex(/\*([^ ][^*]*[^ ])\*/g, '<b>$1</b>');
    string = string.replaceRegex(/_([^ ][^_]*[^ ])_/g, '<u>$1</u>');

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

    return string.replace(/\\n/g, '<br>');
}

Utils.mobileAndTabletcheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return !check;
};

window.addEventListener('load', () => document.body.style.setProperty('--theme', localStorage.theme || 'rgb(231, 76, 60)'));