function TextToOctet(string) {
    return new TextEncoder().encode(string);
}
export default "Oh you're looking for help with octets?\n" +
"Remember, an octet is 8 bits, aka, 1 byte!\n" +
"This probably isn't the form of help you were expecting...";

export { TextToOctet }
