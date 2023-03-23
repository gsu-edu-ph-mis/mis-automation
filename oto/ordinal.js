const english_ordinal_rules = new Intl.PluralRules("en", {type: "ordinal"});
const suffixes = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th"
};

module.exports = (number) => {
    const category = english_ordinal_rules.select(parseInt(number));
    const suffix = suffixes[category];
    return `${number}${suffix}`
}