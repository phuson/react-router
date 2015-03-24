/**
 * Encapsulates a redirect to the given route.
 */
function Redirect(to, params, query, payload) {
  this.to = to;
  this.params = params;
  this.query = query;
  this.payload = payload;
}

module.exports = Redirect;
