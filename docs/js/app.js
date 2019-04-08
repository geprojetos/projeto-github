var myApp = (function(){
    "use-strict"

    const key           = 'key:github';
    let baseUrl         = 'https://api.github.com/repos';
    let supportIndexedDB= false;
    let listReps        = [];
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
    let cont            = 0;
    let limit           = 9;

    const dbName        = 'github-project'
    const dbVersion     = 1;
    const storeName     = 'projects';
    let connection;

    function _render() {

        cont = 0;
        _messageInitial();
        _loadMoreButton();
    };

    function _verifySupportIndexedDB() {

        if(window.indexedDB) {

            console.log('possui suporte');
            supportIndexedDB = true;
            _createConnection();
            
        } else {
            console.log('Não possui suporte');
            supportIndexedDB = false;
            listReps = JSON.parse(window.localStorage.getItem(key)) || [];
            _render();
            console.log(listReps);
        }
    }

    function _createConnection() {

        let request = window.indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function(e) {

            console.log('Cria ou alterar aum conexão');
            
            console.log(e.target.result);
            let newConnection = e.target.result;
            
            if(newConnection.objectStoreNames.contains(storeName)) {
                newConnection.deleteObjectStore(storeName);
                return;
            };

            newConnection.createObjectStore(storeName, { autoIncrement: true });
        };

        request.onsuccess = function(e) {

            console.log('Conexão realizada');
            
            connection = e.target.result;
            _listIndexedDB();
        };

        request.onerror = function(e) {

            console.log(e.target.error);
        };
    };

    function _addIndexedDB(rep) {

        let store = connection
            .transaction(storeName, 'readwrite')
            .objectStore(storeName);

        let request = store.add(rep);
        
        request.onsuccess = function() {
            console.log('Adicionado');
            console.log(listReps);
            _render();
        };

        request.onerror = function() {

            console.log('Não foi adicionado');
        };
    };

    function _listIndexedDB() {
        console.log('entrou na listagem');
        
        let cursor = connection
            .transaction(storeName, 'readwrite')
            .objectStore(storeName)
            .openCursor();

        cursor.onsuccess = function(e) {

            let item = e.target.result;
            
            if(item) {
                
                listReps.push(item.value);
                item.continue();
                
            } else {
                console.log('acabou');
                _render();
                console.log(listReps);
            }
        };

        cursor.onerror = function(e) {
            console.log(e.target.error);
        };
        
    };

    function _removeIndexedDB(indice) {
        console.log('chamou o remover');
        
        let cursor = connection
            .transaction(storeName, 'readwrite')
            .objectStore(storeName)
            .openCursor();

        cursor.onsuccess = function(e) {

            let item = e.target.result;

            if(item) {
                
                if(item.value.id == listReps[indice].id) {
                    
                    let request = item.delete();
                    
                    request.onsuccess = function() {
                        
                        console.log('Removido do db');
                        // listReps.splice(indice, 1);
                        // console.log(listReps);
                        // // _listIndexedDB()
                        // _render();
                        // return;
                    };
                    request.onerror = function(erro) {
                        console.log(erro);
                        console.log('Não foi possível remover do db');
                    }
                }
                
                item.continue();
            } else {
                listReps.splice(indice, 1);
                console.log(listReps);
                _render();
            }
        };

        cursor.onerror = function(e) {
            console.log(e.target.error);
        }
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

    function _createItem() {

        wrapperList.innerHTML = '';

        for(list of listReps) {
            
            let indice = listReps.indexOf(list);

            wrapperList.innerHTML += `
                <li class="col-4">
                    <div class="card mt-2">
                        <header class="card-header bg-info text-white">
                            <h3 class="card-title">${ list.name }</h3>
                        </header>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.owner.avatar_url }" alt="${ list.description }">
                            <p class="card-text">${ list.description }</p>
                            <footer class="card-footer clear-both">
                                <a class="btn btn-info mt-2 btn-inline" href="${ list.html_url }" target="_blank">Acessar</a>
                                <button class="btn btn-danger mt-2 btn-inline" onclick="myApp.templateModalConfirm(${ indice })">Remover</button>
                            </footer>
                        </div>
                    </div>
                </li>
            `

        };        
    };

    function _createItemLoadMore(final) {

        let listCopy = listReps.slice(0, final);

        wrapperList.innerHTML = '';

        for(list of listCopy) {
            
            let indice = listCopy.indexOf(list);

            wrapperList.innerHTML += `
                <li class="col-4">
                    <div class="card mt-2">
                        <header class="card-header bg-info text-white">
                            <h3 class="card-title">${ list.name }</h3>
                        </header>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.owner.avatar_url }" alt="${ list.description }">
                            <p class="card-text">${ list.description }</p>
                            <footer class="card-footer clear-both">
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

    function _verifyRepositoryExisting(rep) {

        let valid = false;

        if(listReps.length) {
            
            for(item of listReps) {
                
                if(item.id === rep.id) {                    
                    return valid = false;
                }
            };

            listReps.unshift(rep);   
            valid = true;

        } else {
            listReps.unshift(rep);   
            valid = true;
        }

        return valid;
    }

    function _addRepository(rep) {
        
        let isExisting = _verifyRepositoryExisting(rep);

        if(isExisting) {
            
            supportIndexedDB ? _addIndexedDB(rep) : _saveLocalStorage();
        };
    };

    function _handleSubmit() {

        form.onsubmit = function(e) {

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
        
        supportIndexedDB 
        ? _removeIndexedDB(indice)
        : listReps.splice(indice, 1) && _saveLocalStorage() && _render();
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
        _render();
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

    function _loadMoreButton() {
        
        let initial = cont;
        let final = cont+=limit;
        
        if (listReps.length <= limit) {
            loadMore.classList.add('d-none');
        } else {
            loadMore.classList.remove('d-none');
        }
        
        _createItemLoadMore(final);
        
        loadMore.onclick = () => _showMoreReps(initial, final)
    };

    function _showMoreReps(initial, final) {

        initial = cont;
        cont+=limit;
        final = cont;
        
        _createItemLoadMore(final);

        for (let i = initial; i < final; i++) {
            
            if(!listReps[i]) {
                loadMore.classList.add('d-none');
                return;
            } else {
                loadMore.classList.remove('d-none');
            }
        }
    };

    _verifySupportIndexedDB();
    // _render();
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
        },
    }
})();

myApp.templateModalConfirm;
myApp.closeModalConfirm;