export class EventHandler{

    private events: EventItem[] = [];
    public constructor(private elem: DocumentAndElementEventHandlers){}

    public addEvent(events: string[] | string, listeners: Listener[] | EventListener): void {
        if(typeof events === 'string'){
            events = [events];
        }

        events.forEach(event => {

            if(typeof listeners === 'function') {
                this.addSingleEventListener(event, listeners);
                return;
            }

            this.addListenersToEvent(event, listeners);
        });
    }

    private addListenersToEvent(event: string, listeners: Listener[]): void {
        const eventFn: EventListener = () => {
            listeners.forEach((item) => {
                item.update(new Event(event));
            });
        }

        this.addSingleEventListener(event, eventFn);
    }

    private addSingleEventListener(event: string, listener: EventListener): void {
        this.elem.addEventListener(event, listener);
        this.events.push({name: event, handler: listener});
    }

    public removeAll(): void {
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