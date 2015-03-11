if (Meteor.isServer) {
	Meteor.startup(function(){
		if(Meteor.users.find().count() < 1){

				id = Accounts.createUser({
				email: "<YOUR_EMAIL>",
				password: "<YOUR_ADMIN_PASSWORD>",
				});

				Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true}});
				// Need _id of existing user record so this call must come 
				// after `Accounts.createUser` or `Accounts.onCreate`
				Roles.addUsersToRoles(id, ['admin']);
				
			
		}
	});
	Meteor.publish('quotes', function() {
		return Quotes.find();
	});

	Meteor.publish('users', function () {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			return Meteor.users.find();
		} else{

			// user not authorized. do not publish secrets
			this.stop();
			return;

		}
});

	Meteor.methods({
		insertQuote: function(artist, quote){
			if(Meteor.user().emails[0].verified === true){
			var ownedBy = this.userId;
			Quotes.insert({
				artist: artist,
				quote: quote,
				createdAt: Date(),
				ownedBy: ownedBy
			});
			}
		},
		isAdmin: function(){
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			return true;
		} else{
			return false;
		}
		}
	});
	Quotes.allow({
		remove: function(userId, doc){
		if (Roles.userIsInRole(userId, ['admin'])) {
			return true;
		} else{
			return (doc.ownedBy === userId);
		}
		},
		insert: function(userId, doc){
			if(Meteor.user().emails[0].verified === true){
				return true;
			}else{
				return false;
			}
		}
	});
	Meteor.users.allow({
		remove: function(userId, doc){
		if (Roles.userIsInRole(userId, ['admin'])) {
			return true;
		} else{
			return false;
		}
		},
		update: function(userId, doc){
		if (Roles.userIsInRole(userId, ['admin'])) {
			return true;
		} else{
			return false;
		}
		},
	});

}
