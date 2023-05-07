/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Function that checks whether the passed file exits and is of type XMI from its extension and MIME Type
 * 
 * @param {*} file The multer-received file to check.
 * @param {[string, list]} additional_extensions The additional valid extensions besides .xmi.
 * @returns true if the file is a valid XMI, or an Error if the file is invalid.
 * @throws Formatted exceptions including the error message and HTTP code.
 */
const check_xmi_file = (file, additional_extensions = null) => {
    const valid_extensions = ['xmi'];
    if (additional_extensions) {
        if (typeof (additional_extensions) === 'string')
            valid_extensions.push(additional_extensions);
        else if (Array.isArray(additional_extensions))
            valid_extensions.push(...additional_extensions);
        else
            throw {
                code: 500,
                error: new Error(`The additional extensions <${additional_extensions}> of type '${typeof (additional_extensions)} are not valid.
                Valid types are 'string' or 'array'.`)
            };
    }
    if (!file) {
        throw {
            code: 422,
            error: new Error(`No file uploaded.`)
        };
    }
    const fileExtension = file.originalname.split('.').pop();
    if (!valid_extensions.includes(fileExtension.toLowerCase())) {
        throw {
            code: 422,
            filepath: file.path,
            error: new Error(`Invalid file format. Only ${valid_extensions} files are allowed. Received ${fileExtension}.`)
        };
    }
    // Not working; receiving 'application/octet-stream' instead of 'application/xmi+xml'
    // const fileMimeType = file.mimetype;
    // if (fileMimeType !== 'application/xmi+xml') {
    //     throw {
    //         code: 422,
    //         filepath: file.path,
    //         error: new Error(`Invalid file format. Only XMI files are allowed. Received ${fileMimeType}.`)
    //     };
    // }
    return true;
};

module.exports = {
    check_xmi_file,
};