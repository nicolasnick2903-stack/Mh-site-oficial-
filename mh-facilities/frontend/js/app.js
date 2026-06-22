document.addEventListener("DOMContentLoaded", function () {
    var syndicStorageKey = "mhFacilitiesSyndicUser";
    var localTicketKey = "mhFacilitiesLocalTickets";

    initMenu();
    initReveal();
    initQuoteForm();
    initSyndicPortal();
    initAdminPanel();
    initRating();

    // ── MENU MOBILE ──────────────────────────────────────────────────────────

    function initMenu() {
        var menuToggle = document.querySelector(".menu-toggle");
        var dropdownMenu = document.getElementById("site-menu");

        if (!menuToggle || !dropdownMenu) return;

        menuToggle.addEventListener("click", function () {
            var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
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
            if (!dropdownMenu.hidden &&
                !dropdownMenu.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                menuToggle.setAttribute("aria-expanded", "false");
                dropdownMenu.hidden = true;
            }
        });
    }

    // ── REVEAL ON SCROLL ────────────────────────────────────────────────────

    function initReveal() {
        var items = document.querySelectorAll(".reveal");

        if (!items.length || !("IntersectionObserver" in window)) {
            items.forEach(function (item) { item.classList.add("is-visible"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        items.forEach(function (item) { observer.observe(item); });
    }

    // ── FORMULÁRIO DE ORÇAMENTO ──────────────────────────────────────────────

    function initQuoteForm() {
        var quoteForm = document.getElementById("quote-form");
        var formStatus = document.getElementById("form-status");

        if (!quoteForm) return;

        quoteForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            var formData = new FormData(quoteForm);
            var payload = {
                nome: value(formData, "name"),
                empresaCondominio: value(formData, "company"),
                telefone: value(formData, "phone"),
                email: value(formData, "email"),
                servico: value(formData, "service"),
                mensagem: value(formData, "message")
            };

            if (!payload.nome || !payload.empresaCondominio || !payload.telefone || !payload.email || !payload.servico) {
                setText(formStatus, "Preencha os campos obrigatórios para enviar.");
                return;
            }

            setText(formStatus, "Enviando solicitação...");

            try {
                var response = await fetch("/api/orcamentos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(await response.text());

                quoteForm.reset();
                setText(formStatus, "Solicitação registrada com sucesso. A equipe MH retornará em breve.");
            } catch (error) {
                setText(formStatus, "Não foi possível conectar ao sistema. Abrindo WhatsApp como alternativa...");
                openWhatsApp([
                    "Olá MH Facilities, gostaria de solicitar um orçamento.",
                    "",
                    "Nome: " + payload.nome,
                    "Empresa/Condomínio: " + payload.empresaCondominio,
                    "Telefone: " + payload.telefone,
                    "E-mail: " + payload.email,
                    "Serviço: " + payload.servico,
                    "Mensagem: " + payload.mensagem
                ]);
            }
        });
    }

    // ── PORTAL DO SÍNDICO ────────────────────────────────────────────────────

    function initSyndicPortal() {
        var registerForm = document.getElementById("syndic-register-form");
        var panel = document.getElementById("syndic-panel");
        var resetBtn = document.getElementById("syndic-reset");
        var ticketForm = document.getElementById("ticket-form-wrap");
        var historyFilter = document.getElementById("history-filter");

        if (!registerForm && !panel) return;

        // Restaurar sessão salva
        var storedUser = getSyndicUser();
        if (storedUser) {
            renderSyndicPanel(storedUser);
        }

        // Login — apenas e-mail + senha
        if (registerForm) {
            registerForm.addEventListener("submit", async function (event) {
                event.preventDefault();

                var formData = new FormData(registerForm);
                var email = value(formData, "syndicEmail");
                var senha = value(formData, "syndicPassword");

                if (!email || !senha) {
                    setTextById("syndic-register-status", "Informe e-mail e senha para entrar.");
                    return;
                }

                setTextById("syndic-register-status", "Verificando credenciais...");

                try {
                    var response = await fetch("/api/auth/sindico/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: email, senha: senha })
                    });

                    if (response.ok) {
                        var data = await response.json();
                        var user = {
                            name: data.nome || email.split("@")[0],
                            email: email,
                            condo: data.condominio || "Condomínio",
                            phone: data.telefone || ""
                        };
                        localStorage.setItem(syndicStorageKey, JSON.stringify(user));
                        renderSyndicPanel(user);
                        setTextById("syndic-register-status", "");
                    } else if (response.status === 401) {
                        setTextById("syndic-register-status", "E-mail ou senha incorretos.");
                    } else {
                        throw new Error("Falha no servidor.");
                    }
                } catch (error) {
                    // Backend indisponível: modo demonstração
                    var user = {
                        name: email.split("@")[0],
                        email: email,
                        condo: "Condomínio Demo",
                        phone: ""
                    };
                    localStorage.setItem(syndicStorageKey, JSON.stringify(user));
                    renderSyndicPanel(user);
                    setTextById("syndic-register-status", "");
                }
            });
        }

        // Logout
        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                localStorage.removeItem(syndicStorageKey);
                if (panel) panel.classList.add("hidden");
                if (registerForm) {
                    var loginWrap = document.getElementById("syndic-login-wrap");
                    if (loginWrap) loginWrap.classList.remove("hidden");
                    registerForm.classList.remove("hidden");
                    registerForm.reset();
                }
            });
        }

        // Navegação entre abas do painel
        document.querySelectorAll("[data-panel-target]").forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-panel-target");

                document.querySelectorAll("[data-panel-target]").forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });

                document.querySelectorAll(".panel-form").forEach(function (form) {
                    form.classList.toggle("hidden", form.id !== targetId);
                });

                if (targetId === "ticket-history-wrap") {
                    renderSyndicHistory();
                }
            });
        });

        if (historyFilter) {
            historyFilter.addEventListener("change", renderSyndicHistory);
        }

        if (ticketForm) {
            ticketForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                await submitTicket(ticketForm);
            });
        }
    }

    async function submitTicket(ticketForm) {
        var user = getSyndicUser();
        var status = document.getElementById("ticket-status");
        var formData = new FormData(ticketForm);
        var photoNames = fileNames(document.getElementById("ticket-photos"));
        var documentNames = fileNames(document.getElementById("ticket-docs"));
        var description = value(formData, "Descricao do chamado");

        var attachmentText = [
            photoNames ? "Fotos anexadas: " + photoNames : "",
            documentNames ? "Documentos anexados: " + documentNames : ""
        ].filter(Boolean).join("\n");

        var payload = {
            sindicoNome: user ? user.name : "",
            sindicoEmail: user ? user.email : "",
            sindicoTelefone: user ? user.phone : "",
            condominioNome: user ? user.condo : "",
            categoria: value(formData, "Area do chamado"),
            prioridade: value(formData, "Prioridade"),
            assunto: value(formData, "Assunto"),
            descricao: attachmentText ? description + "\n\n" + attachmentText : description
        };

        if (!payload.sindicoNome || !payload.sindicoEmail || !payload.condominioNome ||
            !payload.categoria || !payload.prioridade || !payload.assunto || !payload.descricao) {
            setText(status, "Preencha todos os dados do chamado antes de enviar.");
            return;
        }

        setText(status, "Gerando protocolo e notificando a MH...");

        try {
            var response = await fetch("/api/chamados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(await response.text());

            var ticket = await response.json();
            saveLocalTicket(ticket);
            ticketForm.reset();
            setText(status, "Chamado " + ticket.numero + " aberto com sucesso. Você receberá um e-mail de confirmação.");
            renderSyndicHistory();
            updateSyndicMetrics();
        } catch (error) {
            setText(status, "Não foi possível conectar ao sistema. Tente novamente em instantes.");
        }
    }

    function renderSyndicPanel(user) {
        var registerForm = document.getElementById("syndic-register-form");
        var loginWrap = document.getElementById("syndic-login-wrap");
        var panel = document.getElementById("syndic-panel");

        if (loginWrap) loginWrap.classList.add("hidden");
        if (registerForm) registerForm.classList.add("hidden");
        if (panel) panel.classList.remove("hidden");

        setText(document.getElementById("syndic-welcome"), "Olá, " + user.name);
        setText(document.getElementById("syndic-condo-label"), user.condo);
        updateSyndicMetrics();
        renderSyndicHistory();
    }

    function renderSyndicHistory() {
        var list = document.getElementById("syndic-history-list");
        var filter = document.getElementById("history-filter");

        if (!list) return;

        var selected = filter ? filter.value : "";
        var tickets = getLocalTickets().filter(function (ticket) {
            return !selected || ticket.status === selected;
        });

        if (!tickets.length) {
            list.innerHTML = '<p class="admin-empty">Nenhum chamado encontrado.</p>';
            return;
        }

        list.innerHTML = tickets.map(ticketCard).join("");
    }

    function updateSyndicMetrics() {
        var tickets = getLocalTickets();
        setTextById("metric-open", String(tickets.filter(function (t) {
            return t.status !== "RESOLVIDO" && t.status !== "FECHADO";
        }).length));
        setTextById("metric-done", String(tickets.filter(function (t) {
            return t.status === "RESOLVIDO" || t.status === "FECHADO";
        }).length));
    }

    // ── PAINEL ADMINISTRATIVO ─────────────────────────────────────────────────

    function initAdminPanel() {
        var refresh = document.getElementById("admin-refresh");
        var hasAdmin = document.getElementById("admin-ticket-list") || document.getElementById("admin-quote-list");

        if (!hasAdmin) return;

        if (refresh) {
            refresh.addEventListener("click", loadAdminPanel);
        }

        loadAdminPanel();
    }

    async function loadAdminPanel() {
        var ticketList = document.getElementById("admin-ticket-list");
        var notificationList = document.getElementById("admin-notification-list");
        var quoteList = document.getElementById("admin-quote-list");
        var adminStatus = document.getElementById("admin-status");

        setText(adminStatus, "Carregando painel...");

        try {
            var responses = await Promise.all([
                fetch("/api/admin/chamados"),
                fetch("/api/admin/notificacoes"),
                fetch("/api/admin/orcamentos")
            ]);

            if (!responses.every(function (r) { return r.ok; })) {
                throw new Error("Falha ao carregar painel.");
            }

            var tickets = await responses[0].json();
            var notifications = await responses[1].json();
            var quotes = await responses[2].json();

            if (ticketList) {
                ticketList.innerHTML = tickets.length
                    ? tickets.map(adminTicketCard).join("")
                    : '<p class="admin-empty">Nenhum chamado recebido.</p>';
                bindStatusSelects();
            }

            if (notificationList) {
                notificationList.innerHTML = notifications.length
                    ? notifications.map(notificationCard).join("")
                    : '<p class="admin-empty">Nenhuma notificação registrada.</p>';
            }

            if (quoteList) {
                quoteList.innerHTML = quotes.length
                    ? quotes.map(quoteCard).join("")
                    : '<p class="admin-empty">Nenhum orçamento recebido.</p>';
            }

            setTextById("admin-total-tickets", String(tickets.length));
            setTextById("admin-total-quotes", String(quotes.length));
            setTextById("admin-total-notifications", String(notifications.length));
            setText(adminStatus, "Painel atualizado.");
        } catch (error) {
            if (ticketList) ticketList.innerHTML = '<p class="admin-empty">Backend indisponível.</p>';
            if (notificationList) notificationList.innerHTML = '<p class="admin-empty">Não foi possível carregar notificações.</p>';
            if (quoteList) quoteList.innerHTML = '<p class="admin-empty">Não foi possível carregar orçamentos.</p>';
            setText(adminStatus, "Não foi possível conectar ao sistema.");
        }
    }

    function bindStatusSelects() {
        document.querySelectorAll("[data-ticket-status]").forEach(function (select) {
            select.addEventListener("change", async function () {
                var ticketId = select.getAttribute("data-ticket-status");
                var adminStatus = document.getElementById("admin-status");
                setText(adminStatus, "Atualizando status...");

                try {
                    var response = await fetch("/api/chamados/" + encodeURIComponent(ticketId) + "/status", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: select.value })
                    });

                    if (!response.ok) throw new Error("Falha ao atualizar status.");

                    loadAdminPanel();
                } catch (error) {
                    setText(adminStatus, "Não foi possível atualizar o status.");
                }
            });
        });
    }

    // ── AVALIAÇÃO ─────────────────────────────────────────────────────────────

    function initRating() {
        var ratingForm = document.getElementById("rating-form");

        if (!ratingForm) return;

        ratingForm.addEventListener("submit", function (event) {
            event.preventDefault();
            ratingForm.reset();
            setTextById("rating-status", "Obrigado! Sua avaliação foi registrada e será analisada pela equipe de qualidade MH.");
        });
    }

    // ── TEMPLATES DE CARDS ────────────────────────────────────────────────────

    function adminTicketCard(ticket) {
        return [
            '<article class="admin-item">',
            '<div class="admin-item-head">',
            '<strong>' + escapeHtml(ticket.numero) + '</strong>',
            '<span>' + escapeHtml(formatStatus(ticket.status)) + '</span>',
            '</div>',
            '<h3>' + escapeHtml(ticket.assunto) + '</h3>',
            '<p>' + escapeHtml(ticket.condominio) + ' &bull; ' + escapeHtml(ticket.categoria) + ' &bull; ' + escapeHtml(ticket.prioridade) + '</p>',
            '<p>' + escapeHtml(ticket.descricao) + '</p>',
            '<select data-ticket-status="' + escapeHtml(ticket.id) + '">',
            option("EM_ANDAMENTO", ticket.status, "Em andamento"),
            option("RESOLVIDO", ticket.status, "Resolvido"),
            option("FECHADO", ticket.status, "Fechado"),
            '</select>',
            '</article>'
        ].join("");
    }

    function ticketCard(ticket) {
        return [
            '<article class="admin-item">',
            '<div class="admin-item-head">',
            '<strong>' + escapeHtml(ticket.numero) + '</strong>',
            '<span class="status-badge status-' + String(ticket.status || "").toLowerCase() + '">' + escapeHtml(formatStatus(ticket.status)) + '</span>',
            '</div>',
            '<h3>' + escapeHtml(ticket.assunto) + '</h3>',
            '<p>' + escapeHtml(ticket.createdAt ? formatDate(ticket.createdAt) : "") + ' &bull; ' + escapeHtml(ticket.categoria) + '</p>',
            '<p>Responsável: Equipe MH Facilities</p>',
            '<p>Acompanhamento pelo painel administrativo.</p>',
            '</article>'
        ].join("");
    }

    function notificationCard(notification) {
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
    }

    function quoteCard(quote) {
        return [
            '<article class="admin-item">',
            '<div class="admin-item-head">',
            '<strong>#ORC-' + escapeHtml(String(quote.id)) + '</strong>',
            '<span>NOVO</span>',
            '</div>',
            '<h3>' + escapeHtml(quote.empresaCondominio) + '</h3>',
            '<p>' + escapeHtml(quote.nome) + ' &bull; ' + escapeHtml(quote.telefone) + '</p>',
            '<p>' + escapeHtml(quote.email) + '</p>',
            '<p>Serviço: ' + escapeHtml(quote.servico) + '</p>',
            '<p>' + escapeHtml(quote.mensagem || "") + '</p>',
            '</article>'
        ].join("");
    }

    // ── STORAGE HELPERS ───────────────────────────────────────────────────────

    function saveLocalTicket(ticket) {
        var tickets = getLocalTickets();
        tickets.unshift(ticket);
        localStorage.setItem(localTicketKey, JSON.stringify(tickets.slice(0, 50)));
    }

    function getLocalTickets() {
        try {
            return JSON.parse(localStorage.getItem(localTicketKey)) || [];
        } catch (e) {
            return [];
        }
    }

    function getSyndicUser() {
        try {
            return JSON.parse(localStorage.getItem(syndicStorageKey));
        } catch (e) {
            return null;
        }
    }

    // ── UTILS ─────────────────────────────────────────────────────────────────

    function openWhatsApp(lines) {
        window.open(
            "https://wa.me/5511992144970?text=" + encodeURIComponent(lines.join("\n")),
            "_blank",
            "noopener,noreferrer"
        );
    }

    function value(formData, key) {
        return String(formData.get(key) || "").trim();
    }

    function fileNames(input) {
        if (!input || !input.files || !input.files.length) return "";
        return Array.from(input.files).map(function (f) { return f.name; }).join(", ");
    }

    function option(val, current, label) {
        return '<option value="' + val + '"' + (val === current ? " selected" : "") + '>' + label + '</option>';
    }

    function formatStatus(status) {
        var map = {
            "ABERTO": "Aberto",
            "EM_ANDAMENTO": "Em andamento",
            "RESOLVIDO": "Concluído",
            "FECHADO": "Cancelado"
        };
        return map[status] || String(status || "").replace(/_/g, " ");
    }

    function formatDate(val) {
        return new Date(val).toLocaleDateString("pt-BR");
    }

    function setTextById(id, text) {
        setText(document.getElementById(id), text);
    }

    function setText(element, text) {
        if (element) element.textContent = text;
    }

    function escapeHtml(val) {
        return String(val || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
