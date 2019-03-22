var myApp = (function(){
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
            
            let indice = listRepos.indexOf(list);

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
                                <button class="btn btn-danger btn-block mt-2" onclick="myApp.handleRemove(${ indice })">Remover</button>
                            </div>
                        </div>
                    </div>
                </li>
            `

        };        
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
            .catch(erro => erro)
    };

    function _findRepositoryAndReportMessage(repository) {

        _clearErrorSearch();
        _clearSuccessSearch();
        _setSearching();

        return _findRepository(repository)
            .then(res => {
                
                if(res.statusText) {
                    throw res;
                } else {
                    _addRepository(res);
                    _clearSearching();
                    _setSuccessSearch();
                    return true;
                }
                
            })
            .catch(erro => {

                _clearSearching();
                _setErrorSearch();
                console.log(erro.statusText);
                return erro;
            })
    };

    function _addRepository(rep) {
        
        listRepos.push(rep);
        _render();
    };

    function _handleSubmit() {

        form.onsubmit = e => {

            e.preventDefault();
            
            _findRepositoryAndReportMessage(inputRepostory.value.trim().toLowerCase())
                .then(res => {
                    if(res === true) {
                        
                        _clearForm();
                        return;
                    }
                })
        }
    };

    function _clearForm() {

        inputRepostory.value = '';
        inputRepostory.focus();
    };

    function _setSearching() {

        searching.classList.remove('d-none');
        searching.textContent = 'Procurando pelo repositório, aguarde...';
    };

    function _clearSearching() {

        searching.classList.add('d-none');
        searching.textContent = '';
    };

    function _setErrorSearch() {

        errorSearch.classList.remove('d-none');
        errorSearch.textContent = 'Não foi possível encontrar o repositório, verique se o nome foi digitado corretamente';
        inputRepostory.focus();
    };

    function _clearErrorSearch() {

        errorSearch.classList.add('d-none');
        errorSearch.textContent = '';
    };

    function _setSuccessSearch() {

        successSearch.classList.remove('d-none');
        successSearch.textContent = 'Repositório encontrado com sucesso';
    };

    function _clearSuccessSearch() {

        successSearch.classList.add('d-none');
        successSearch.textContent = '';
    };

    function _handleRemove(indice) {
    
        _removeRepository(indice);
    };

    function _removeRepository(indice) {
    
        listRepos.splice(indice, 1);
        _render();
    };

    _render();
    _handleSubmit();
    
    return {
        
        handleRemove: function(indice) {
            _handleRemove(indice);
        }
    }
})()

myApp.handleRemove;