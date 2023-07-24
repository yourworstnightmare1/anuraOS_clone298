class Taskbar {
    activeTray: HTMLElement;

    state: {
        apps: App[];
    } = stateful({
        apps: [],
    });

    dragged = null;
    insidedrag = false;

    element = (
        <footer>
            <div id="launcher-button-container">
                <div
                    id="launcher-button"
                    on:click={() => {
                        launcher.toggleVisible();
                    }}
                >
                    <img
                        src="/assets/icons/launcher.svg"
                        style="height:100%;width:100%"
                    ></img>
                </div>
            </div>
            <nav
                id="taskbar-bar"
                on:dragover={(e: DragEvent) => {
                    e.preventDefault();
                }}
                on:drop={(e: DragEvent) => {
                    this.insidedrag = true;
                    e.preventDefault();
                }}
            >
                <ul
                    bind:activeTray={this}
                    for={React.use(this.state.apps)}
                    do={(app: App) => {
                        if (!app) return;
                        const t = (
                            <li class="taskbar-button" bind:tmp={this}>
                                <input
                                    type="image"
                                    draggable="true"
                                    src={app?.icon || ""}
                                    on:dragend={() => {
                                        if (!this.insidedrag) {
                                            for (const i of app.windows) {
                                                i.close();
                                            }
                                            anura.settings.set(
                                                "applist",
                                                anura.settings
                                                    .get("applist")
                                                    .filter(
                                                        (p: string) =>
                                                            p != app.package,
                                                    ),
                                            );
                                            this.updateTaskbar();
                                        }
                                        this.dragged = null;
                                        this.insidedrag = false;
                                    }}
                                    on:dragstart={() => {
                                        this.dragged = t;
                                    }}
                                    class="showDialog"
                                    on:click={(e: MouseEvent) => {
                                        console.log("???");
                                        console.log(app.windows.length);
                                        if (app.windows.length == 1) {
                                            app.windows[0]!.focus();
                                        } else {

                                            this.showcontext(app, e);
                                        }

                                    }}
                                    on:contextmenu={(e: MouseEvent) => {
                                        this.showcontext(app, e);
                                    }}
                                />
                                <div
                                    class="lightbar"
                                    style={
                                        "position: relative; bottom: 1px; background-color:#FFF; width:50%; left:50%; transform:translateX(-50%)" +
                                        (app.windows?.length == 0
                                            ? ";visibility:hidden"
                                            : "")
                                    }
                                    bind:lightbar={this}
                                ></div>
                            </li>
                        );
                        return t;
                    }}
                ></ul>
            </nav>
            <div
                id="taskinfo-container"
                on:click={() => {
                    anura.apps["anura.settings"].open();
                }}
            >
                <div class="flex flexcenter">
                    <p>19:23</p>

                    <span class="material-symbols-outlined">battery_0_bar</span>

                    <span class="material-symbols-outlined">settings</span>
                </div>
            </div>
        </footer>
    );

    showcontext(app: App, e: MouseEvent) {
        if (app.windows.length > 0) {
            const newcontextmenu =
                new anura.ContextMenu();
            newcontextmenu.addItem(
                "New Window",
                () => {
                    app.open();
                },
            );

            let winEnumerator = 0;
            for (const win of app.windows) {
                let displayTitle =
                    win.wininfo.title;
                if (win.wininfo.title === "")
                    displayTitle =
                        "Window " +
                        winEnumerator;
                newcontextmenu.addItem(
                    displayTitle,
                    () => {
                        win.focus();
                        win.unminimize();
                    },
                );
                winEnumerator++;
            }
            const pinned = anura.settings
                .get("applist")
                .includes(app.package);
            newcontextmenu.addItem(
                pinned ? "Unpin" : "Pin",
                () => {
                    if (pinned) {
                        anura.settings.set(
                            "applist",
                            anura.settings
                                .get("applist")
                                .filter(
                                    (
                                        p: string,
                                    ) =>
                                        p !=
                                        app.package,
                                ),
                        );
                    } else {
                        anura.settings.set(
                            "applist",
                            [
                                ...anura.settings.get(
                                    "applist",
                                ),
                                app.package,
                            ],
                        );
                    }
                },
            );

            newcontextmenu.addItem(
                "Uninstall",
                () => {
                    alert("todo");
                },
            );
            const c = newcontextmenu.show(
                e.x,
                0,
            );
            // HACK HACK DUMB HACK
            c.style.top = "";
            c.style.bottom = "69px";

            console.log(c);
        } else {
            app.open();
        }

    }



    // shortcuts: { [key: string]: Shortcut } = {};
    constructor() { }
    addShortcut(app: App) {
        // const shortcut = new Shortcut(app);
        // this.shortcuts[app.package] = shortcut;
        // return shortcut;
    }
    killself() {
        this.element.remove();
    }
    updateTaskbar() {
        const pinned = anura.settings
            .get("applist")
            .map((id: string) => anura.apps[id]);
        const activewindows = Object.values(anura.apps).filter(
            (a: App) => a.windows.length > 0,
        );

        this.state.apps = [...new Set([...pinned, ...activewindows])];
    }
    // removeShortcuts() {
    //     for (const name in this.shortcuts) {
    //         this.shortcuts[name]!.element.remove();
    //         delete this.shortcuts[name];
    //     }
    // }
}
