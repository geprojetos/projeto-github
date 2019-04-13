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
    let warning         = document.querySelector('.warning');
    let danger          = document.querySelector('.danger');
    let success         = document.querySelector('.success');
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

    let view = {

        render: function() {

            cont = 0;
            model.messageInitial();
            _loadMoreButton();
        },

        repositories: function(final) {

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
                                    <button class="btn btn-danger mt-2 btn-inline" onclick="myApp.modalConfirm(${ indice })">Remover</button>
                                </footer>
                            </div>
                        </div>
                    </li>
                `
            };        
        },
        modalConfirm: function(pos) {

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
        },
    };

    let model = {

        verifySupportIndexedDB: function() {

            if(window.indexedDB) {
    
                console.log('Possui suporte');
                supportIndexedDB = true;
                model.createConnection();
                
            } else {
                console.log('Não possui suporte');
                supportIndexedDB = false;
                listReps = JSON.parse(window.localStorage.getItem(key)) || [];
                view.render()
            }
        },
        createConnection: function() {

            let request = window.indexedDB.open(dbName, dbVersion);
    
            request.onupgradeneeded = function(e) {
    
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
                model.listIndexedDB();
            };
    
            request.onerror = function(e) {
    
                console.log(e.target.error);
            };
        },
        listIndexedDB: function() {
        
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
                    listReps.reverse();
                    view.render();
                }
            };
    
            cursor.onerror = function(e) {
                console.log(e.target.error);
            };
            
        },
        messages: function() {

            return {
                add: 'Repositório adicionado',
                remove: 'Repositório removido',
                removeErro: 'Não foi possivel remover esse repositório, tente novamente ou procure pelo desenvolvedor do site',
                searching: 'Buscando pelo respositório, aguarde...',
                notFound: 'Não foi possível encontrar o repositório, verique se o nome foi digitado corretamente e tente novamente',
                repExisting: 'Este repositório já está presente na sua lista',
            }
        },
        messageInitial: function() {
        
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
        },
        setSuccess: function(message) {

            success.classList.remove('d-none');
            success.textContent = message;
        },
        setInfo: function(message) {

            info.classList.remove('d-none');
            info.textContent = message;
        },
        setWarning: function(message) {

            warning.classList.remove('d-none');
            warning.textContent = message;
        },
        setError: function(message) {

            danger.classList.remove('d-none');
            danger.textContent = message;
            inputRepository.focus();
        },
        clearAllMessages: function() {
            model.clearError();
            model.clearSuccess();
            model.clearInfo();
        },
        clearSearching: function() {

            warning.classList.add('d-none');
            warning.textContent = '';
        },
        clearSuccess: function() {

            success.classList.add('d-none');
            success.textContent = '';
        },
        clearInfo: function() {
        
            info.classList.add('d-none');
            info.textContent = '';
        },
        clearError: function() {

            danger.classList.add('d-none');
            danger.textContent = '';
        },
        inputErroStyle: function() {

            inputRepository.classList.add('border-danger');
            inputErroMessage.textContent = 'Por favor, preencha o campo com o nome do usuário e do repositório. exemplo: usuário/repositório'
            inputRepository.focus();
        },
        inputClearErro: function() {
        
            inputRepository.classList.remove('border-danger');
            inputErroMessage.textContent = '';
        },
        saveLocalStorage: function() {

            window.localStorage.setItem(key, JSON.stringify(listReps));
            console.log('gravado no localStorage');
            view.render();
            
        },
        addIndexedDB: function(rep) {

            let store = connection
                .transaction(storeName, 'readwrite')
                .objectStore(storeName);
    
            let request = store.add(rep);
            
            request.onsuccess = function() {
                
                console.log(listReps);
                model.setSuccess(model.messages().add);
                view.render();
                console.log('gravado no db');
            };
    
            request.onerror = function(e) {
    
                console.log(e.target.error);
            };
        },
        removeIndexedDB: function(indice) {
        
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
                            model.setInfo(model.messages().remove);
                        };
                        request.onerror = function(erro) {
                            
                            console.log(erro);
                            model.setWarning(model.messages().removeErro)
                        }
                    }
                    
                    item.continue();
                } else {
                    listReps.splice(indice, 1);
                    console.log(listReps);
                    view.render();
                }
            };
    
            cursor.onerror = function(e) {
                console.log(e.target.error);
            }
        },
        findRepositoryAndReportMessage: function(repository) {

            model.clearAllMessages();
            model.setWarning(model.messages().searching);
    
            return model.findRepository(repository)
                .then(function(res) {
                    
                    if(res.statusText) {
                        throw res;
                    } else {
                        model.addRepository(res);
                        return true;
                    }
                    
                })
                .catch(function(erro) {
    
                    model.clearSearching();
                    model.setError(model.messages().removeErro);
                    console.log(erro);
                    return erro;
                })
        },
        findRepository: function(repository) {

            return fetch(`${ baseUrl }/${ repository }`)
                .then(function(res) {
    
                    if(!res.ok) {
                        throw res;
                    } else {
                        return res.json();
                    }
                })
                .catch(function(erro) {
                    console.log(erro);
                })
        },
        verifyRepositoryExisting: function(rep) {

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
        },
        addRepository: function(rep) {
        
            let isExisting = model.verifyRepositoryExisting(rep);
    
            if(isExisting) {
                
                model.clearSearching();
                
                if(supportIndexedDB) {
                    model.addIndexedDB(rep);
                } else {
                    model.setSuccess(model.messages().add);
                    model.saveLocalStorage();
                }
            } else {
                model.clearSearching();
                model.setInfo(model.messages().repExisting);
            }
        },
        removeRepository: function(indice) {    
        
            if(supportIndexedDB) {
    
                model.removeIndexedDB(indice);
            } else {
    
                listReps.splice(indice, 1);
                model.setInfo(model.messages().remove); 
                model.saveLocalStorage(); 
                view.render();
            }
             
        },
        validateForm: function() {

            if(!inputRepository.value) {
    
                model.inputErroStyle();
                return false;
            };
    
            model.inputClearErro();
            return true;
        },
        clearForm: function() {

            inputRepository.value = '';
            inputRepository.focus();
        },
        showMoreReps: function(initial, final) {

            initial = cont;
            cont+=limit;
            final = cont;
            
            view.repositories(final);
    
            for (let i = initial; i < final; i++) {
                
                if(!listReps[i]) {
                    loadMore.classList.add('d-none');
                    return;
                } else {
                    loadMore.classList.remove('d-none');
                }
            }
        },
    };

    let controller = {

    };

    function _handleSubmit() {

        form.onsubmit = function(e) {

            e.preventDefault();
            
            let isValid = model.validateForm();

            if(isValid) {

                model.findRepositoryAndReportMessage(inputRepository.value.trim().toLowerCase())
                    .then(function(res) {
                        if(res === true) {
                            
                            model.clearForm();
                            return;
                        }
                    })
            }
        }
    };

    function _handleRemove(indice) {
            
        model.removeRepository(indice);
        model.clearSuccess();
        model.clearError();
        _closeModalConfirm();
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
        
        view.repositories(final);
        
        loadMore.onclick = function() {
            
            model.showMoreReps(initial, final)
        }
    };

    model.verifySupportIndexedDB();
    _handleSubmit();
    
    return {
        
        modalConfirm: function(pos) {
            view.modalConfirm(pos);
        },
        closeModalConfirm: function() {
            _closeModalConfirm();
        },
        handleRemove: function(indice) {
            _handleRemove(indice);
        },
    }
})();

myApp.modalConfirm;
myApp.closeModalConfirm;