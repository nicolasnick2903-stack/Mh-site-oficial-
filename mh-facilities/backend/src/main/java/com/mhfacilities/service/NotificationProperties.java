package com.mhfacilities.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "mh.notifications")
public class NotificationProperties {

    private List<String> adminEmails = new ArrayList<>();
    private String adminWhatsappNumber;
    private String whatsappProvider = "meta";
    private String whatsappToken;
    private String whatsappPhoneNumberId;
    private String twilioAccountSid;
    private String twilioAuthToken;
    private String twilioFromNumber;

    public List<String> getAdminEmails() {
        return adminEmails;
    }

    public void setAdminEmails(List<String> adminEmails) {
        this.adminEmails = adminEmails;
    }

    public String getAdminWhatsappNumber() {
        return adminWhatsappNumber;
    }

    public void setAdminWhatsappNumber(String adminWhatsappNumber) {
        this.adminWhatsappNumber = adminWhatsappNumber;
    }

    public String getWhatsappProvider() {
        return whatsappProvider;
    }

    public void setWhatsappProvider(String whatsappProvider) {
        this.whatsappProvider = whatsappProvider;
    }

    public String getWhatsappToken() {
        return whatsappToken;
    }

    public void setWhatsappToken(String whatsappToken) {
        this.whatsappToken = whatsappToken;
    }

    public String getWhatsappPhoneNumberId() {
        return whatsappPhoneNumberId;
    }

    public void setWhatsappPhoneNumberId(String whatsappPhoneNumberId) {
        this.whatsappPhoneNumberId = whatsappPhoneNumberId;
    }

    public String getTwilioAccountSid() {
        return twilioAccountSid;
    }

    public void setTwilioAccountSid(String twilioAccountSid) {
        this.twilioAccountSid = twilioAccountSid;
    }

    public String getTwilioAuthToken() {
        return twilioAuthToken;
    }

    public void setTwilioAuthToken(String twilioAuthToken) {
        this.twilioAuthToken = twilioAuthToken;
    }

    public String getTwilioFromNumber() {
        return twilioFromNumber;
    }

    public void setTwilioFromNumber(String twilioFromNumber) {
        this.twilioFromNumber = twilioFromNumber;
    }
}
