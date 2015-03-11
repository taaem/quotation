if (Meteor.isClient) {
  Router.route('/', function () {
    this.render('home');
  });
  Session.set('artist', 'all');
  Meteor.subscribe('quotes');
  Meteor.subscribe('users');

  Template.home.helpers({
    quotes: function(){
      if(Session.get('onlyByUser') && Session.get('artist') === 'all'){
        return Quotes.find({ownedBy: Meteor.userId()});
      }else if (Session.get('onlyByUser') && Session.get('artist') != 'all') {
        return Quotes.find({artist: Session.get('artist'), ownedBy: Meteor.userId()});
      }else if(Session.get('artist') === undefined){
        return Quotes.find();        
      }else if (Session.get('artist') != 'all') {
        return Quotes.find({artist: Session.get('artist')});
      }else if (Session.get('artist') === 'all' ) {
        return Quotes.find();
      }else{
        return Quotes.find();
      }
    },
    onlyByUser: function(){
      return Session.get('onlyByUser');
    },
    artists: function(){
      var distinctEntries = _.uniq(Quotes.find({}, {
        sort: {artist: 1}, fields: {artist: true}
      }).fetch().map(function(x) {
        return x.artist;
      }), true);
      return distinctEntries;
    },
    verifiedUser: function(){
      return Meteor.user().emails[0].verified;
    },
  });
  Template.quote.helpers({
    ownedByUser: function(){
      Meteor.call('isAdmin', function(err, res){
        Session.set('isAdmin', res);
      });
      if (Session.get('isAdmin')) {
        return false;
      }else{
      return (this.ownedBy === Meteor.userId());
      }
    },

  });
  Template.admin.helpers({
    users: function(){
      var user = Meteor.users.find();
      return user;
    },
  });


 Template.home.events({
    'click .logout-button': function(event){
      Meteor.logout();
    },
    'submit .new-quote': function(event) {
      $('#new-quote').slideToggle('fast');
      var quote = event.target.quote.value;
      var artist = event.target.artist.value;
      Meteor.call('insertQuote', artist, quote);
      event.target.artist.value = "";
      event.target.quote.value = "";


      return false;
    },
    'click #add-new-quote': function(event){
      $('#new-quote').slideToggle('fast');
    },
    'change .onlyByUser': function(event){
      Session.set('onlyByUser', event.target.checked);
    },
    'click .admin-button': function(event){
      $('.admin-container').slideToggle('fast');
    },
    'change #artist-select': function(event){
      Session.set('artist', event.target.value);
    },
  });
  Template.quote.events({
  'click .delete': function(){
    Quotes.remove(this._id);
  }
});
  Template.forms.events({
    'submit #login-form' : function(e, t){
      e.preventDefault();
      $('.login-form').slideToggle('fast');
      setTimeout(function() {
        $('.handler-login').slideToggle('fast');
        $('.handler-register').slideToggle('fast');
      }, 500);


      // retrieve the input field values
      var email = t.find('#login-email').value, 
      password = t.find('#login-password').value;

        // Trim and validate your fields here.... 

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err){
        if (err){
          alert('Failed to Login, check your password/email');
        }else{

        }
      });
         return false; 
      },
      'submit #register-form' : function(e, t) {
      $('.register-form').slideToggle('fast'); 
      setTimeout(function() {
      $('.handler-register').slideToggle('fast');
      $('.handler-login').slideToggle('fast');
      }, 500);


      e.preventDefault();
      var email = t.find('#account-email').value,
      password = t.find('#account-password').value;

        // Trim and validate the input

      Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            alert('Failed to create Account');// Inform the user that account creation failed
          } else {
          }

        });

      return false;
    },
    'click .handler-login': function(event){
      $('.handler-login').slideToggle('fast');
      $('.handler-register').slideToggle('fast');
      setTimeout(function() {
        $('.login-form').slideToggle('fast');
      }, 500);


    },
    'click .handler-register': function(event){
      $('.handler-register').slideToggle('fast');
      $('.handler-login').slideToggle('fast');
      setTimeout(function() {
      $('.register-form').slideToggle('fast');
      }, 500);


    }
  });

   Template.admin.events({
    'click .delete': function(event){
      Meteor.users.remove(this._id);
    },
    'click .verify': function(event){
      var userId = Meteor.users.findOne({'emails.0.address': this.address});
      Meteor.users.update({_id: userId._id}, {$set: {"emails.0.verified": true}});
    }
   });
}


