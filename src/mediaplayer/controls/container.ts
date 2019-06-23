export class Container implements Controls {

    node: HTMLElement;

    set innerHTML(text: string){
        this.node.innerHTML = text;
    }
    constructor(className = null, type = "DIV"){
        this.node = document.createElement(type);

        if(className != null)
            this.addClass(className);
    }
    addClass(className: string){
        this.node.classList.add(className);
    }
    append(child: Container){
        this.node.appendChild(child.node);
    }
    appendMultiple(children: Container[]){
        children.forEach((child) => {
            this.append(child);
        });
    }
}

export interface Controls {
    node: HTMLElement;
}