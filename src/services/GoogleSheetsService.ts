export const config = {
    // Configured in App environment or .env, but hardcoded here for easy modification
    ZAPIER_WEBHOOK_URL: '', // <--- Pegar aquí tu URL de Zapier / Make / Webhook
};

export interface LeadData {
    amount: number;
    months: number;
    monthlyQuota: number;
    totalToReturn: number;
    prestaxGain: number; // Tu ganancia aproximada
    timestamp: string;
}

export const submitLeadToCRM = async (leadData: LeadData) => {
    console.log('📝 Lead captured:', leadData);

    if (!config.ZAPIER_WEBHOOK_URL) {
        console.warn('⚠️ No Webhook URL provided. Lead simulation successful.');
        return true;
    }

    try {
        const response = await fetch(config.ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('❌ Fallo al enviar al CRM de Google Sheets/Zapier', error);
        return false;
    }
};
