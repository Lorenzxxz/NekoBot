Array.prototype.remove = function(index){
	i = this.indexOf(index)
	if (i > -1) {
		this.splice(i, 1)
	}
	return this
}
Array.prototype.random = function () {
	const obj = (array) => array[Math.floor(Math.random() * array.length)]
	return obj(this)
}
String.prototype.capitalize = function () {
	return this.toLowerCase()
		.split(' ')
		.map((str) => str.charAt(0).toUpperCase() + str.slice(1))
		.join(' ');
};
String.prototype.code = function(){
	return "```" + this + "```"
}
String.prototype.bold = function(){
	return "*" + this + "*"
}
String.prototype.italic = function(){
	return "_" + this + "_"
}
String.prototype.through = function(){
	return "~" + this + "~"
}
String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
}
String.prototype.reverse = function() {
  return this.split("").reverse().join("")
}