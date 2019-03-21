(function(){
    "use-strict"

    let listRepos   = [
        {
            title: 'Primeiro',
            img: 'https://trello-avatars.s3.amazonaws.com/0c984c7d40ee3680fa8e1eb97a21bd69/30.png',
            desc: 'DEscrição 1',
            rep: 'Link do repositório 1'
        },
        {
            title: 'Segundo',
            img: 'https://yt3.ggpht.com/a-/AAuE7mDMgJdxLr67xIch3lj0egc9RZXiZhMXIglFew=s48-mo-c-c0xffffffff-rj-k-no',
            desc: 'DEscrição 2',
            rep: 'Link do repositório 2'
        }
    ];
    let repsList        = document.querySelector('.reps');

    
    function _render() {

        console.log('Exibe os repositórios');
        
        _createItem();
    };
    
    function _createItem() {

        // reps.innerHTML = '';

        for(list of listRepos) {
            
            repsList.innerHTML += `
                <li class="col-6">
                    <div class="card mt-2">
                        <div class="card-header bg-dark text-white">
                            <h3 class="card-title">${ list.title }</h3>
                        </div>
                        <div class="card-body">
                            <img class="img-fluid card-img-top" src="${ list.img }" alt="${ list.desc }">
                            <p class="card-text">${ list.desc }</p>
                            <div>
                                <a href="${ list.rep }" class="btn btn-info btn-block mt-2 clear-both">Acessar repositório</a>
                                <a href="#" class="btn btn-danger btn-block mt-2">Remover</a>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }

    }

    _render();
    
})()