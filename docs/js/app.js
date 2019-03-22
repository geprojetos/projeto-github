(function(){
    "use-strict"

    let baseUrl         = 'https://api.github.com/repos';
    let listRepos       = [];
    let wrapperList     = document.querySelector('.wrapper-list');
    let form            = document.querySelector('.form');
    let inputRepostory  = document.querySelector('.input-repository');
    let searching       = document.querySelector('.searching');
    let errorSearch     = document.querySelector('.errorSearch');
    let successSearch   = document.querySelector('.successSearch');

    
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

        _clearErrorSearch();
        _clearSuccessSearch();
        _setSearching();

        return fetch(`${ baseUrl }/${ repository }`)
            .then(res => {

                if(!res.ok) {
                    throw res;
                } else {
                    return res.json();
                }
            })
            .then(rep => {
                
                _addRepository(rep);
                _clearSearching();
                _setSuccessSearch();
            })
            .catch(erro => {

                _clearSearching();
                _setErrorSearch();
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
    };

    function _setSearching() {

        searching.textContent = 'Procurando pelo repositório, aguarde...';
    };

    function _clearSearching() {

        searching.textContent = '';
    };

    function _setErrorSearch() {

        errorSearch.textContent = 'Não foi possível encontrar o repositório, verique se o nome foi digitado corretamente'
    };

    function _clearErrorSearch() {

        errorSearch.textContent = '';
    };

    function _setSuccessSearch() {

        successSearch.textContent = 'Repositório encontrado com sucesso';
    };

    function _clearSuccessSearch() {

        successSearch.textContent = '';
    };

    _render();
    _handleSubmit();
})()