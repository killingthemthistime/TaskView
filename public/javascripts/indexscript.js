
// make sure to include datadefs in html document
var globData=[];

$(document).ready(function(err)
{
    getTasks();
});

$(document).resize(function()
{

});




// flag indicating filters have not been set up yet.
//var initial =1;



// sets the grid container properties
function setContainerProps(containerId)
{

  resetColumns();

  var c = nextColumns();

  var sizestring = "grid-template-columns: ";

  while (c!=null)
  {
    sizestring+=c.Width+"px ";
    c=nextColumns();
  }

  sizestring+=";"

  $('#'+containerId).attr('style',sizestring);
}
 

// sets up the grid and populates it with data from getTasks() call
function setGrid(data)
{
  var t = $('#taskcontainer');

  datamappings = [];

  // clear data and header rows
  t.children().remove('div');

  setContainerProps('taskcontainer');

  // set up headers and links

  resetColumns();

  var column =nextColumns();
  

  while (column!=null)
  {
    var item =column.Header;
    
    // for later use TODO: move this to another area in initialization code or make it a constant

    // add cell header div
      $('<div/>')
      .attr('id',column.HeaderDivName)
      .addClass('cellheader')
      .html(item)
      .appendTo(t);
 
      $('<br>').appendTo('#'+column.HeaderDivName);

      // add sort icon next to header text
      $('<img>')
      .addClass('resizeimage')
      .attr('id',column.SortButtonName)
      .attr('src','images/inactive arrow.png')
      .attr('data-col',item)
      .appendTo('#'+column.HeaderDivName);

      // add click event handler to sort arrow icon next to header
      $('#'+column.SortButtonName).click(function()
      {
        // retrieve the id from the data-col attribute
         var id =  $(this).attr('data-col');
         console.log('id discovered was'+ id);

         var f = Filters[id];

         switch(f.Direction)
         {
           
           case SortOptions.None:
             f.Direction = SortOptions.Up;
             f.Priority = getMaxPriority()+1;

             // add sort priority control next to sort arrow
             $('<span>')
             .attr('id',id+'order')
             .attr('data-col',id)
             .appendTo('#'+f.HeaderDivName);
      
             $('#'+f.OrderButtonName).click(function()
             {
                var id =  $(this).attr('data-col');
                updateOrder(id);
             });

             // transform icon to active and turn right side up to indicate ascending order sort
             $(this).addClass('invertrotate arrowactive');
             break;

           case SortOptions.Up:
             Filters[id].Direction = SortOptions.Down;
             
             // transform icon to turn downwards to indicate descending order
             $(this).removeClass('invertrotate');
             break;

           case SortOptions.Down:
             Filters[id].Direction = SortOptions.None;
             removeOrder(id);

             //revert sort arrow to original appearance
             $(this).removeClass('arrowactive');
             // remove sort priority control
             $('#'+f.OrderButtonName).remove();
             break;
         }

         refreshOrders();

      });
    
      column=nextColumns();
  }


  // populate grid with provided data
  for (item of data)
  {
   //  var item = data[id]

     resetColumns();
     var column= nextColumns();
     
     while (column!=null)
     {

      var datapiece ="";

      switch(column.Handler)
      {
        case 'Priority':
          switch(item[column.DataId])
          {
            case 'L':
              datapiece="Low";
              break;
            case 'M':
              datapiece="Medium";
              break;
            case 'H':
              datapiece="High";
              break;
            default:
              datapiece=" ";
              break;
            }
          break;

        case 'Tag':
          if (typeof item[column.DataId] != "undefined")
          {
            for (tag of item[column.DataId])
            {
              datapiece+='+'+tag+" ";
            }
          }
          break;

        default:
            datapiece=item[column.DataId];
          break;
      }
      
      $('<div>')
      .attr('data-uuid',item.uuid)
      .html(datapiece)
      .addClass('dataitem')
      .appendTo(t);

      column=nextColumns();
     }
  }

}


function refreshOrders()
{
  for (filterId in Filters)
  {
    var f = Filters[filterId];

    if (f.Priority >0)
    {
      $('#'+f.OrderButtonName).text(f.Priority);
    }
  }
}

// for when an update needs forced, like after turning off sorting on a column
function removeOrder(Id)
{
  var ori = Filters[Id].Priority;

  Filters[Id].Priority=0;

  for (filterId in Filters)
  {
    f = Filters[filterId];

    if (f.Priority > ori)
    {
      // shift the items after the previous priority back by one.
        f.Priority--;
    }
  }

}

// updates the value of the priority field when user clicks the priority box
// assumes no new items have just been turned on.
function updateOrder(Id)
{

  console.log ('Id in udord is '+Id);
  // retrieve the max a-fucking-gain
  // while sitting waiting for an annoying black male to not bug U
 
  var max = getMaxPriority();

  // get the current items priority
  var ori = Filters[Id].Priority;

  console.log('max is '+max);
  console.log('original priority is '+ori);
  
 

  if (ori==max)
  {
    Filters[Id].Priority=1;
  }
  else
  {
    Filters[Id].Priority++;
  }


  // priority is set to last

  if (ori ==  max)
  {
    for (filterId in Filters)
    {
      // skip the selected item otherwise increment priority
      if (filterId != Id)
      {
        Filters[filterId].Priority++;
      }               
    }
  }
  else
  {
    // use case for a priority which was in the middle somewhere
  
    for (filterId in Filters)
    {
      var item = Filters[filterId];

      if (item.Priority !=0 && filterId !=Id)
      {
          if (item.Priority == max)
          {
            item.Priority=1;
          }  
          else
          {
            item.Priority++;
          }
      }
    }
  }

  refreshOrders();
}


function getMaxPriority()
{

  var prior=0;

  for (id in Filters)
  {
    if (Filters[id].Priority > prior)
    {
      prior = Filters[id].Priority;
    }
  }


  return prior;
}

function getTasks()
{

  var jqxhr = $.getJSON( "/users/getTasks", 
    function(data) 
    {
      console.log( "success" );
      globData=data;
      setGrid(data);
    })
  .done(function() 
  {
      console.log( "second success" );
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
  
}
