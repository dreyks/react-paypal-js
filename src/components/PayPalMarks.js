import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { usePayPalScriptReducer } from "../ScriptContext";
/**
 * The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons.
 * The [Display PayPal Buttons with other Payment Methods guide](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#display-paypal-buttons-with-other-payment-methods) describes this style of integration in detail.
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * ```jsx
 *     <PayPalMarks />
 * ```
 *
 * This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
 * A `FUNDING` object is exported by this library which has a key for every available funding source option.
 *
 * ```js
 *     import { FUNDING } from '@paypal/react-paypal-js'
 * ```
 *
 * Use this `FUNDING` constant to set the `fundingSource` prop.
 *
 * ```jsx
 *     <PayPalMarks fundingSource={FUNDING.PAYPAL}/>
 * ```
 */
export default function PayPalMarks(props) {
    const [{ isLoaded, options }] = usePayPalScriptReducer();
    const markContainerRef = useRef(null);
    const mark = useRef(null);

    useEffect(() => {
        if (isLoaded && !mark.current) {
            verifyGlobalStateForMarks(options);

            mark.current = window.paypal.Marks({ ...props });

            if (mark.current.isEligible()) {
                mark.current.render(markContainerRef.current);
            }
        }
    });

    return <div ref={markContainerRef} />;
}

function verifyGlobalStateForMarks({ components = "" }) {
    if (typeof window.paypal.Marks !== "undefined") {
        return;
    }

    let errorMessage =
        "Unable to render <PayPalMarks /> because window.paypal.Marks is undefined.";

    // the JS SDK does not load the Marks component by default. It must be passed into the "components" query parameter.
    if (!components.includes("marks")) {
        const expectedComponents = components ? `${components},marks` : "marks";

        errorMessage +=
            "\nTo fix the issue, add 'marks' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }
    throw new Error(errorMessage);
}

PayPalMarks.propTypes = {
    /**
     * The individual mark to render. Use the `FUNDING` constant exported by this library to set this value.
     * View the [list of available funding sources](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#funding-sources) for more info.
     */
    fundingSource: PropTypes.string,
};
