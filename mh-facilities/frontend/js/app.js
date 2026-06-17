document.addEventListener("DOMContentLoaded", function () {
    const quoteForm = document.getElementById("quote-form");
    const formStatus = document.getElementById("form-status");

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

    function openWhatsApp(lines, statusElement) {
        const whatsappUrl = "https://wa.me/5511992144970?text=" + encodeURIComponent(lines.join("\n"));

        if (statusElement) {
            statusElement.textContent = "Abrindo WhatsApp...";
        }

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
});
