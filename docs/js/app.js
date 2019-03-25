var myApp = (function(){
    "use-strict"

    const key           = 'key:github';
    let baseUrl         = 'https://api.github.com/repos';
    let listReps        = JSON.parse(window.localStorage.getItem(key)) || [];
    let wrapperList     = document.querySelector('.wrapper-list');
    let form            = document.querySelector('.form');
    let inputRepository = document.querySelector('.input-repository');
    let inputErroMessage= document.querySelector('.repositoryHelp');
    let searching       = document.querySelector('.searching');
    let errorSearch     = document.querySelector('.errorSearch');
    let successSearch   = document.querySelector('.successSearch');
    let info            = document.querySelector('.info');
    let notCards        = document.querySelector('.not-cards');
    let modalConfirm    = document.querySelector('.modal-confirm');
    let loadMore        = document.querySelector('.load-more');
    
    function _render() {

        // console.log(listReps);
        
        _messageInitial();
        // _createItem();
        _loadMore();
    };
    
    function _messageInitial() {
        
        if(listReps.length > 0) {
            
            notCards.classList.add('d-none');
            notCards.innerHTML = '';
        } else {
            
            notCards.classList.remove('d-none');
            notCards.innerHTML = `
                <h3>Você não possui nenhum repositório</h3>
                <p>Use o campo de procurar logo a cima e adicione os seus repositórios favoritos.</p>
            `;
        }
    };

    function _createItem(reps) {

        wrapperList.innerHTML = '';

        for(list of reps) {
            
            let indice = reps.indexOf(list);

            wrapperList.innerHTML += `
                <li class="col-6">
                    <div class="card mt-2">
                        <header class="card-header bg-info text-white">
                            <h3 class="card-title">${ list.name }</h3>
                        </header>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.owner.avatar_url }" alt="${ list.description }">
                            <p class="card-text">${ list.description }</p>
                            <footer class="clear-both">
                                <a class="btn btn-info mt-2 btn-inline" href="${ list.html_url }" target="_blank">Acessar</a>
                                <button class="btn btn-danger mt-2 btn-inline" onclick="myApp.templateModalConfirm(${ indice })">Remover</button>
                            </footer>
                        </div>
                    </div>
                </li>
            `

        };        
    };
    
    function __createItem() {

        wrapperList.innerHTML = '';

        for(list of listReps) {
            
            let indice = listReps.indexOf(list);

            wrapperList.innerHTML += `
                <li class="col-6">
                    <div class="card mt-2">
                        <header class="card-header bg-info text-white">
                            <h3 class="card-title">${ list.name }</h3>
                        </header>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.owner.avatar_url }" alt="${ list.description }">
                            <p class="card-text">${ list.description }</p>
                            <footer class="clear-both">
                                <a class="btn btn-info mt-2 btn-inline" href="${ list.html_url }" target="_blank">Acessar</a>
                                <button class="btn btn-danger mt-2 btn-inline" onclick="myApp.templateModalConfirm(${ indice })">Remover</button>
                            </footer>
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
        _clearInfo();
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
        
        listReps.push(rep);
        _saveLocalStorage();
        _render();
    };

    function _handleSubmit() {

        form.onsubmit = e => {

            e.preventDefault();
            
            let isValid = _validateForm();

            if(isValid) {

                _findRepositoryAndReportMessage(inputRepository.value.trim().toLowerCase())
                    .then(res => {
                        if(res === true) {
                            
                            _clearForm();
                            return;
                        }
                    })
            }
        }
    };

    function _clearForm() {

        inputRepository.value = '';
        inputRepository.focus();
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
        errorSearch.textContent = 'Não foi possível encontrar o repositório, verique se o nome foi digitado corretamente e tente novamente';
        inputRepository.focus();
    };

    function _clearErrorSearch() {

        errorSearch.classList.add('d-none');
        errorSearch.textContent = '';
    };

    function _setSuccessSearch() {

        successSearch.classList.remove('d-none');
        successSearch.textContent = 'Repositório adicionado a sua lista';
    };

    function _clearSuccessSearch() {

        successSearch.classList.add('d-none');
        successSearch.textContent = '';
    };

    function _setInfo() {

        info.classList.remove('d-none');
        info.textContent = 'Repositório removido';
    };

    function _clearInfo() {
        
        info.classList.add('d-none');
        info.textContent = '';
    };

    function _handleRemove(indice) {
            
        _removeRepository(indice);
        _clearSuccessSearch();
        _clearErrorSearch();
        _setInfo();
        _closeModalConfirm();
    };

    function _removeRepository(indice) {
    
        listReps.splice(indice, 1);
        _saveLocalStorage();
        _render();
    };

    function _validateForm() {

        if(!inputRepository.value) {

            _inputErroStyle();
            return false;
        };

        _inputClearErro();
        return true;
    };

    function _inputErroStyle() {

        inputRepository.classList.add('border-danger');
        inputErroMessage.textContent = 'Por favor, preencha o campo com o nome do usuário e do repositório. exemplo: usuário/repositório'
        inputRepository.focus();
    };

    function _inputClearErro() {
        
        inputRepository.classList.remove('border-danger');
        inputErroMessage.textContent = '';
    };

    function _saveLocalStorage() {

        window.localStorage.setItem(key, JSON.stringify(listReps));
    };

    function _templateModalConfirm(pos) {

        document.querySelector('body').classList.add('modal-visible');

        modalConfirm.innerHTML = `
            <div class="modal" tabindex="-1" role="dialog" aria-labelledby="modalConfirm" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <header class="modal-header bg-success modal-header text-white">
                            <h4 class="modal-title" id="modalConfirm">Deseja remover esse repositório?</h4>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" onclick="myApp.closeModalConfirm()">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </header>
                        <div class="modal-body">
                            Esse repositório será removido da sua lista, deseja continuar?
                        </div>
                        <footer class="modal-footer bg-light">
                            <button type="button" class="btn btn-success" onclick="myApp.handleRemove(${ pos })">Confirmar</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal" onclick="myApp.closeModalConfirm()">Cancelar</button>
                        </footer>
                    </div>
                </div>
            </div>
            <div class="modal-overlay"></div>
        `
    };

    function _closeModalConfirm() {
        document.querySelector('body').classList.remove('modal-visible');
    };

    function _loadMore() {

        let cont = 0;
        let list = [];

        loadMore.onclick = () => {
            let initial = cont;
            console.log('Valor inicial ' + initial);
            cont+=2;
            console.log(`Valor final ${ cont }`);

            
            for (let i = initial; i < cont; i++) {
                
                list = list.concat(listReps[i]);
                console.log(list);
                console.log(i);
                
                if(!listReps[i]) {
                    console.log('Não possui mais reps');
                    loadMore.classList.add('d-none');
                    return;
                } else {
                    loadMore.classList.remove('d-none');
                    _createItem(list);
                }
                
            }
            
            
        }
    }

    _render();
    _handleSubmit();
    
    return {
        
        templateModalConfirm: function(pos) {
            _templateModalConfirm(pos);
        },
        closeModalConfirm: function() {
            _closeModalConfirm();
        },
        handleRemove: function(indice) {
            _handleRemove(indice);
        }
    }
})();

myApp.templateModalConfirm;
myApp.closeModalConfirm;