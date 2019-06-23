export class EventHandler{

    private elem: DocumentAndElementEventHandlers;
    private events: EventItem[];

    constructor(elem: DocumentAndElementEventHandlers){
        this.elem = elem;
        this.events = [];
    }

    addEventWithListeners(event: string, listeners: Listener[]){
        const eventFn: EventListener = () => {
            listeners.forEach((item) => {
                item.update(new Event(event));
            });
        }

        this.addSingleEventListener(event, eventFn);
    }

    addSingleEventListener(event: string, listener: EventListener) {
        this.elem.addEventListener(event, listener);
        this.events.push({name: event, handler: listener});
    }

    addEvents(events: string[], listeners: Listener[]){
        events.forEach((item) => {
            this.addEventWithListeners(item, listeners);
        });
    }

    removeAll(){
        this.events.forEach((event) =>{
            this.elem.removeEventListener(event.name, event.handler);
        });
    }
}

interface EventItem {
    name: string;
    handler: EventListener;
}

export interface Listener {
    update: EventListener;
}