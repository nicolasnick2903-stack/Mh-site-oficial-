document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const dropdownMenu = document.getElementById("site-menu");
    const quoteForm = document.getElementById("quote-form");
    const formStatus = document.getElementById("form-status");
    const syndicRegisterForm = document.getElementById("syndic-register-form");
    const syndicPanel = document.getElementById("syndic-panel");
    const syndicReset = document.getElementById("syndic-reset");
    const syndicWelcome = document.getElementById("syndic-welcome");
    const syndicCondoLabel = document.getElementById("syndic-condo-label");
    const panelActions = document.querySelectorAll("[data-panel-target]");
    const panelForms = document.querySelectorAll(".panel-form");
    const ticketForm = document.getElementById("ticket-form-wrap");
    const ticketStatus = document.getElementById("ticket-status");
    const syndicStorageKey = "mhFacilitiesSyndicUser";

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener("click", function () {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute("aria-expanded", String(!isOpen));
            dropdownMenu.hidden = isOpen;
        });

        dropdownMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menuToggle.setAttribute("aria-expanded", "false");
                dropdownMenu.hidden = true;
            });
        });

        document.addEventListener("click", function (event) {
            if (!dropdownMenu.hidden && !dropdownMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                menuToggle.setAttribute("aria-expanded", "false");
                dropdownMenu.hidden = true;
            }
        });
    }

    if (quoteForm) {
        quoteForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(quoteForm);
            const name = String(formData.get("name") || "").trim();
            const company = String(formData.get("company") || "").trim();
            const service = String(formData.get("service") || "").trim();
            const message = String(formData.get("message") || "").trim();

            if (!name || !company || !service) {
                if (formStatus) {
                    formStatus.textContent = "Preencha os campos obrigatorios para enviar.";
                }
                return;
            }

            const lines = [
                "Ola MH Facilities, gostaria de solicitar um orcamento.",
                "",
                "Nome: " + name,
                "Empresa/condominio: " + company,
                "Servico: " + service
            ];

            if (message) {
                lines.push("Mensagem: " + message);
            }

            openWhatsApp(lines, formStatus);
        });
    }

    hydrateSyndicArea();

    if (syndicRegisterForm) {
        syndicRegisterForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(syndicRegisterForm);
            const user = {
                name: String(formData.get("syndicName") || "").trim(),
                cpf: String(formData.get("syndicCpf") || "").trim(),
                email: String(formData.get("syndicEmail") || "").trim(),
                condo: String(formData.get("syndicCondo") || "").trim()
            };

            if (!user.name || !user.cpf || !user.email || !user.condo) {
                setText("syndic-register-status", "Preencha todos os dados para criar o usuario.");
                return;
            }

            localStorage.setItem(syndicStorageKey, JSON.stringify(user));
            renderSyndicPanel(user);
            setText("syndic-register-status", "");
        });
    }

    if (syndicReset && syndicRegisterForm && syndicPanel) {
        syndicReset.addEventListener("click", function () {
            localStorage.removeItem(syndicStorageKey);
            syndicPanel.classList.add("hidden");
            syndicRegisterForm.classList.remove("hidden");
            syndicRegisterForm.reset();
        });
    }

    panelActions.forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.getAttribute("data-panel-target");

            panelActions.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });

            panelForms.forEach(function (form) {
                form.classList.toggle("hidden", form.id !== targetId);
            });
        });
    });

    document.querySelectorAll(".panel-form").forEach(function (form) {
        form.addEventListener("submit", function () {
            fillSyndicHiddenFields(form);
        });
    });

    if (ticketForm) {
        ticketForm.addEventListener("submit", function (event) {
            const user = getSyndicUser();
            const area = String(new FormData(ticketForm).get("Area do chamado") || "").trim();
            const description = String(new FormData(ticketForm).get("Descricao do chamado") || "").trim();

            if (!user || !area || !description) {
                event.preventDefault();
                if (ticketStatus) {
                    ticketStatus.textContent = "Preencha os dados do chamado antes de enviar.";
                }
                return;
            }

            const lines = [
                "Novo chamado de condominio - MH Facilities",
                "",
                "Sindico: " + user.name,
                "CPF: " + user.cpf,
                "Email: " + user.email,
                "Condominio: " + user.condo,
                "Area: " + area,
                "Descricao: " + description
            ];

            openWhatsApp(lines, ticketStatus);
        });
    }

    function openWhatsApp(lines, statusElement) {
        const whatsappUrl = "https://wa.me/5511992144970?text=" + encodeURIComponent(lines.join("\n"));

        if (statusElement) {
            statusElement.textContent = "Abrindo WhatsApp...";
        }

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    function hydrateSyndicArea() {
        const user = getSyndicUser();

        if (user) {
            renderSyndicPanel(user);
        }
    }

    function renderSyndicPanel(user) {
        if (syndicRegisterForm) {
            syndicRegisterForm.classList.add("hidden");
        }

        if (syndicPanel) {
            syndicPanel.classList.remove("hidden");
        }

        if (syndicWelcome) {
            syndicWelcome.textContent = "Ola, " + user.name;
        }

        if (syndicCondoLabel) {
            syndicCondoLabel.textContent = "Condominio: " + user.condo;
        }

        document.querySelectorAll(".panel-form").forEach(function (form) {
            fillSyndicHiddenFields(form);
        });
    }

    function fillSyndicHiddenFields(form) {
        const user = getSyndicUser();

        if (!user || !form) {
            return;
        }

        form.querySelectorAll("[data-syndic-field]").forEach(function (field) {
            const key = field.getAttribute("data-syndic-field");
            field.value = user[key] || "";
        });
    }

    function getSyndicUser() {
        try {
            return JSON.parse(localStorage.getItem(syndicStorageKey));
        } catch (error) {
            return null;
        }
    }

    function setText(id, text) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = text;
        }
    }
});
