// Local XML search; literal text queries and DOM nodes keep excerpts predictable.
var searchFunc = function (path, searchId, contentId) {
  var input = document.getElementById(searchId);
  var results = document.getElementById(contentId);
  if (!input || !results) return;
  fetch(path).then(function (response) {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.text();
  }).then(function (xml) {
    var entries = Array.from(new DOMParser().parseFromString(xml, 'text/xml').querySelectorAll('entry')).map(function (entry) {
      var get = function (name) { var node = entry.querySelector(name); return node ? node.textContent : ''; };
      var content = new DOMParser().parseFromString(get('content'), 'text/html').body.textContent || '';
      return { title: get('title'), content: content, url: get('url') };
    });
    input.addEventListener('input', function () {
      results.replaceChildren();
      var query = input.value.trim().toLowerCase();
      if (!query) return;
      var words = query.split(/\s+/);
      var matches = entries.filter(function (entry) {
        var text = (entry.title + ' ' + entry.content).toLowerCase();
        return words.every(function (word) { return text.includes(word); });
      });
      if (!matches.length) { results.textContent = 'No results.'; return; }
      var list = document.createElement('ul');
      list.className = 'search-result-list';
      matches.forEach(function (entry) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.className = 'search-result-title';
        link.textContent = entry.title;
        var url = new URL(entry.url, window.location.origin);
        if (url.origin !== window.location.origin) return;
        link.href = url.pathname + url.search + url.hash;
        item.appendChild(link);
        var snippet = document.createElement('p');
        snippet.className = 'search-result';
        var position = Math.max(0, entry.content.toLowerCase().indexOf(words[0]) - 30);
        snippet.textContent = entry.content.slice(position, position + 150) + '…';
        item.appendChild(snippet);
        list.appendChild(item);
      });
      results.appendChild(list);
    });
  }).catch(function () { input.placeholder = 'Search unavailable'; });
};
