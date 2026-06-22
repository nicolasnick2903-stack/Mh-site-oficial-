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
    const adminRefresh = document.getElementById("admin-refresh");
    const adminStatus = document.getElementById("admin-status");
    const adminTicketList = document.getElementById("admin-ticket-list");
    const adminNotificationList = document.getElementById("admin-notification-list");
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
                phone: String(formData.get("syndicPhone") || "").trim(),
                condo: String(formData.get("syndicCondo") || "").trim()
            };

            if (!user.name || !user.cpf || !user.email || !user.phone || !user.condo) {
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
        ticketForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const user = getSyndicUser();
            const formData = new FormData(ticketForm);
            const area = String(formData.get("Area do chamado") || "").trim();
            const priority = String(formData.get("Prioridade") || "").trim();
            const subject = String(formData.get("Assunto") || "").trim();
            const description = String(formData.get("Descricao do chamado") || "").trim();

            if (!user || !area || !priority || !subject || !description) {
                if (ticketStatus) {
                    ticketStatus.textContent = "Preencha os dados do chamado antes de enviar.";
                }
                return;
            }

            if (ticketStatus) {
                ticketStatus.textContent = "Abrindo chamado e registrando notificacoes...";
            }

            try {
                const response = await fetch("/api/chamados", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        sindicoNome: user.name,
                        sindicoCpf: user.cpf,
                        sindicoEmail: user.email,
                        sindicoTelefone: user.phone,
                        condominioNome: user.condo,
                        categoria: area,
                        prioridade: priority,
                        assunto: subject,
                        descricao: description
                    })
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || "Nao foi possivel abrir o chamado.");
                }

                const ticket = await response.json();
                ticketForm.reset();
                if (ticketStatus) {
                    ticketStatus.textContent = "Chamado " + ticket.numero + " aberto com sucesso. A MH foi notificada por e-mail e WhatsApp.";
                }
                loadAdminPanel();
            } catch (error) {
                if (ticketStatus) {
                    ticketStatus.textContent = "Nao foi possivel conectar ao sistema. Verifique se o backend esta ativo.";
                }
            }
        });
    }

    if (adminRefresh) {
        adminRefresh.addEventListener("click", loadAdminPanel);
        loadAdminPanel();
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

    async function loadAdminPanel() {
        if (!adminTicketList || !adminNotificationList) {
            return;
        }

        if (adminStatus) {
            adminStatus.textContent = "Carregando...";
        }

        try {
            const responses = await Promise.all([
                fetch("/api/admin/chamados"),
                fetch("/api/admin/notificacoes")
            ]);

            if (!responses[0].ok || !responses[1].ok) {
                throw new Error("Falha ao carregar painel.");
            }

            const tickets = await responses[0].json();
            const notifications = await responses[1].json();

            renderTickets(tickets);
            renderNotifications(notifications);

            if (adminStatus) {
                adminStatus.textContent = "Painel atualizado.";
            }
        } catch (error) {
            adminTicketList.innerHTML = '<p class="admin-empty">Backend indisponivel.</p>';
            adminNotificationList.innerHTML = '<p class="admin-empty">Nao foi possivel carregar o historico.</p>';
            if (adminStatus) {
                adminStatus.textContent = "Nao foi possivel conectar ao sistema.";
            }
        }
    }

    function renderTickets(tickets) {
        if (!tickets.length) {
            adminTicketList.innerHTML = '<p class="admin-empty">Nenhum chamado recebido ainda.</p>';
            return;
        }

        adminTicketList.innerHTML = tickets.map(function (ticket) {
            return [
                '<article class="admin-item">',
                '<div class="admin-item-head">',
                '<strong>' + escapeHtml(ticket.numero) + '</strong>',
                '<span>' + formatStatus(ticket.status) + '</span>',
                '</div>',
                '<h4>' + escapeHtml(ticket.assunto) + '</h4>',
                '<p>' + escapeHtml(ticket.condominio) + ' | ' + escapeHtml(ticket.categoria) + ' | ' + escapeHtml(ticket.prioridade) + '</p>',
                '<p>' + escapeHtml(ticket.descricao) + '</p>',
                '<select data-ticket-status="' + ticket.id + '">',
                statusOption("EM_ANDAMENTO", ticket.status, "Em andamento"),
                statusOption("RESOLVIDO", ticket.status, "Resolvido"),
                statusOption("FECHADO", ticket.status, "Fechado"),
                '</select>',
                '</article>'
            ].join("");
        }).join("");

        adminTicketList.querySelectorAll("[data-ticket-status]").forEach(function (select) {
            select.addEventListener("change", function () {
                updateTicketStatus(select.getAttribute("data-ticket-status"), select.value);
            });
        });
    }

    function renderNotifications(notifications) {
        if (!notifications.length) {
            adminNotificationList.innerHTML = '<p class="admin-empty">Nenhuma notificacao registrada ainda.</p>';
            return;
        }

        adminNotificationList.innerHTML = notifications.map(function (notification) {
            return [
                '<article class="admin-item">',
                '<div class="admin-item-head">',
                '<strong>' + escapeHtml(notification.tipo) + '</strong>',
                '<span>' + escapeHtml(notification.statusEnvio) + '</span>',
                '</div>',
                '<p>Chamado ' + escapeHtml(notification.chamadoNumero || "-") + '</p>',
                '<p>' + escapeHtml(notification.destinatario) + '</p>',
                '</article>'
            ].join("");
        }).join("");
    }

    async function updateTicketStatus(ticketId, status) {
        if (!status) {
            return;
        }

        if (adminStatus) {
            adminStatus.textContent = "Atualizando status...";
        }

        try {
            const response = await fetch("/api/chamados/" + encodeURIComponent(ticketId) + "/status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            });

            if (!response.ok) {
                throw new Error("Falha ao atualizar status.");
            }

            loadAdminPanel();
        } catch (error) {
            if (adminStatus) {
                adminStatus.textContent = "Nao foi possivel atualizar o status.";
            }
        }
    }

    function statusOption(value, current, label) {
        return '<option value="' + value + '"' + (value === current ? " selected" : "") + '>' + label + '</option>';
    }

    function formatStatus(status) {
        return String(status || "").replace(/_/g, " ");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
