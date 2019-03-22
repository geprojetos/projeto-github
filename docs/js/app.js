(function(){
    "use-strict"

    let baseUrl         = 'https://api.github.com/repos';
    let listRepos       = [];
    let wrapperList     = document.querySelector('.wrapper-list');
    let form            = document.querySelector('.form');
    let inputRepostory  = document.querySelector('.input-repository');

    
    function _render() {

        console.log('Exibe os repositórios');
        console.log(listRepos);
        
        
        _createItem();
    };
    
    function _createItem() {

        wrapperList.innerHTML = '';

        for(list of listRepos) {
            
            wrapperList.innerHTML += `
                <li class="col-6">
                    <div class="card mt-2">
                        <div class="card-header bg-dark text-white">
                            <h3 class="card-title">${ list.name }</h3>
                        </div>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.owner.avatar_url }" alt="${ list.description }">
                            <p class="card-text">${ list.description }</p>
                            <div>
                                <a class="btn btn-info btn-block mt-2 clear-both" href="${ list.html_url }" target="_blank">Acessar repositório</a>
                                <a href="#" class="btn btn-danger btn-block mt-2">Remover</a>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }

    };

    function _findRepository(repository) {

        return fetch(`${ baseUrl }/${ repository }`)
            .then(res => {

                if(!res.ok) {
                    throw res;
                } else {
                    return res.json();
                }
            })
            .then(rep => _addRepository(rep))
            .catch(erro => {
                console.log(erro);
                return erro;
            })
    };

    function _addRepository(rep) {
        
        listRepos.push(rep);
        _render();
    }

    function _handleSubmit() {

        form.onsubmit = e => {

            e.preventDefault();
            
            _findRepository(inputRepostory.value);
            _clearForm();
        }
    };

    function _clearForm() {

        inputRepostory.value = '';
        inputRepostory.focus();
    }

    _render();
    _handleSubmit();
})()