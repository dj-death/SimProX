class MKError implements Error {
    name;
    message;
    errorCode;

    constructor(message: any, errorCode: any) {
        this.message = message;
        this.errorCode = errorCode;
    }


    static errorCode = {
        common: {
            notUpdate: 10001,
            notFound: 10002,
            notCreate: 10003,
            alreadyExist: 10004
        },

        register: {
            captcha: 20001
        },

        userInfo: {
            phoneExisted: 30001
        }
    }

}



export = MKError;