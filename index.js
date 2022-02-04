var editor; // use a global for the submit and return data rendering in the examples
	var formId="sample";
	var oTable;
	$(document).ready(function(){
		$('#formID').hide();
		var seq=createTable();
		$('#seq').text(seq);
		$("#formID").validationEngine('attach',
		{
			onValidationComplete: function(form, status){
				if (!verifyLocalStorageCapability) {
					alert("Local Storage is not supported.");
					return;
				}
				if (status) {
					save();
					location.reload(true);
				}
			}
		});
	});

	function createTable() {
		var dataSet=[];
		var skip=0;
		var seq=0;
		var index=0;
		var icons  ='<span class="glyphicon glyphicon-edit">&nbsp;</span><span class="glyphicon glyphicon-remove"></span>';

		while ( skip<2 ) {
			var key=formId+"_"+index;
			var json=localStorage.getItem(key);
			if ( json==null || json=="null" || json=="[object Object]" ) {
				index=index+1;
				skip=skip+1;
				continue;
			}
			var object=null;
			object=JSON.parse(json);
			var note= object.note;
			note=note.replace(/\n/g, "<br>");
			dataSet[seq]=[index, icons, object.userId, object.timestamp, object.temperature, object.current, object.noise, note];
			index=index+1;
			seq=seq+1;
		}

		oTable=$('#table').dataTable({
			"data": dataSet,
			"columns": [
			{ "title": "Seq", "class": "center" },
			{ "title": "", "class": "center" },
			{ "title": "User" },
			{ "title": "Time" },
			{ "title": "Temp.<br>(degC)", "class": "center" },
			{ "title": "Current<br>(mA)", "class": "center" },
			{ "title": "Noise" },
			{ "title": "Note" }
			]
		});

		$('#table tbody').on( 'click', '.glyphicon-remove', function () {
		    var row = $(this).parents('tr');
		    var seq = row.children()[0].innerHTML;
		    if(window.confirm('Are you sure to delete? Seq='+seq)){
		    	var key=formId+"_"+seq;
		    	localStorage.removeItem(key);
		    	restoreItems();
        		location.reload(true);
		    }
		} );

		$('#add').on( 'click', function () {
		    $('#list').hide();
		    $('#seq').text(seq);
		    $('#formID').show();
		} );

		$('#cancel').on( 'click', function () {
		    location.reload(true);
		} );

		$('#table tbody').on( 'click', '.glyphicon-edit', function () {
		    $('#list').hide();
		    var rows = $(this).parents('tr').children();
		    $('#seq').text(rows[0].innerHTML);
		    $('#useId').val(rows[2].innerHTML);
		    $('#temperature').val(rows[4].innerHTML);
		    $('#current').val(rows[5].innerHTML);
		    $('input[name="noise"]').val([rows[6].innerHTML]);
		    $('#note').val((rows[7].innerHTML).replace(/(<br>)/g, "\n"));
		    $('#formID').show();
		} );

		return seq;
	}

	function save() {
		var d=new Date();
		var timestamp=d.getFullYear()+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+("0"+(d.getDate())).slice(-2)+" "+("0"+(d.getHours())).slice(-2)+":"+("0"+(d.getMinutes())).slice(-2)+":"+("0"+(d.getSeconds())).slice(-2)+"."+("0"+(d.getMilliseconds())).slice(-2);
		var seq=$('#seq').text();
		if ( isNaN(seq) ) { seq=0; }
		var key=formId+"_"+seq;
		var object={
			"userId":$("#useId").val(),
			"timestamp": timestamp,
			"temperature": $("#temperature").val(),
			"current": $("#current").val(),
			"noise":$('input[name="noise"]:checked').val(),
			"note": $("#note").val()
		}
		localStorage.setItem(key, JSON.stringify(object));
		alert("Saved!")
	}

	function restoreItems() {
		var skip=0;
		var index=1;
		var previous=JSON.parse(localStorage.getItem(formId+"_0"));
		var prevIndex=0;
		while ( skip<2 ) {
			var key=formId+"_"+index;
			var object=JSON.parse(localStorage.getItem(key));
			if ( previous==null && object==null ) {
				skip=skip+1;
				prevIndex=index;
				index=index+1;
				continue;
			}
			if ( previous==null && object!=null ) {
				localStorage.setItem(formId+"_"+prevIndex, JSON.stringify(object));
				localStorage.setItem(key, null);
				prevIndex=index;
				index=index+1;
				continue;
			}
			previous=object;
			prevIndex=index;
			index=index+1;
		}
	};


	function verifyLocalStorageCapability() {
		if (!window.localStorage) {
	    	return false;
		}
		return true;
	}