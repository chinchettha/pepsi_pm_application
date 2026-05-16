$(document).ready(function () {
	var table = $('#tablelist').DataTable({
		pageLength: 10,
		serverSide: true,
		processing: true,
		ajax: {
			url: gUrl + gClass + '/get_datatables'
		},
		'columns': [
            {
				data: 'code',
				render: function (data, type, row) {
					return '<a href="' + gUrl + gClass + '/pages/' + row['id'] + '" data-id="' + row['id'] + '" data-toggle="modal" data-target="#ajaxLargeModal" class="btn-edit">' + data + '</a> ';
				}
            },
            {
				data: 'name',
				render: function (data, type, row) {
					return '<a href="' + gUrl + gClass + '/pages/' + row['id'] + '" data-id="' + row['id'] + '" data-toggle="modal" data-target="#ajaxLargeModal" class="btn-edit">' + data + '</a> ';
				}
            },
            {
                data: 'department_name'
            },
            {
                data: 'membertype_name'
            },
			{
				data: 'is_active',
				render: function (data, type, row) {
					var active = '<span class="fa fa-check"></span>';
					var inactive = '<span class="fa fa-minus"></span>';
					var status = (data == true) ? active : inactive;
					return status;
				}
			},
			{
				data: 'id',
				render: function (data, type, row) {
					var dataName = row['name'];
					var btnEdit = '<a href="' + gUrl + gClass + '/pages/' + row['id'] + '" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-edit"></i> ' + gEdit + '</a> ';
					//var btnDelete = '<a href="#" data-href="' + gUrl + 'api/members/' + data + '" data-id="' + data + '" data-name="' + dataName + '" role="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="fa fa-trash"></i> ' + gDelete + '</a>';
					var btnDelete = '<a href="#" data-href="' + gUrl + 'tb_equipment' + data + '" data-id="' + data + '" data-name="' + dataName + '" role="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="fa fa-trash"></i> ' + gDelete + '</a>';
					return btnEdit + btnDelete;
				},
				orderable: false
			}
		]
    });

	$('#ajaxLargeModal').on('shown.bs.modal', function (e) {
		$('#modalForm').validate({
			submitHandler: function (form) {
				if(!app.item.department){
					showBox('กรุณาเลือกแผนก', 'warning');
					return false;
				}
				if(!app.item.membertype){
					showBox('กรุณาเลือกประเภทสมาชิก', 'warning');
					return false;
				}
				
				axios.post(gUrl + 'api/members', app.item, {headers:{'api-key': gApiKey}})
				.then(function (response) {
					if(response.status === 200){
						showBox('บันทึกข้อมูลสำเร็จ', 'success');
						table.ajax.reload();
					} else {
						showBox('Status not 200', 'error');
					}
				})
				.catch(function (error) {
					console.log(error);
					showBox('เกิดข้อผิดพลาด', 'error');
				});

				$('#ajaxLargeModal').modal('hide');

				return false;
			},
			rules: {
				name: {
					required: true,
					remote: {
						url: gUrl + gClass + '/name_check',
						type: 'post',
						data: {
							name: function () {
								return app.item.name;
							},
							id: app.item.id
						}
					}
                },
                code: {
					required: true,
					remote: {
						url: gUrl + gClass + '/code_check',
						type: 'post',
						data: {
							name: function () {
								return app.item.code;
							},
							id: app.item.id
						}
					}
                }
			},
			messages: {
				name: {
					remote: 'ชื่อสมาชิก {0} มีใช้ไปแล้ว!',
                },
                code: {
                    remote: 'รหัสสมาชิก {0} มีใช้ไปแล้ว!',
                }
			},
			errorElement: 'span',
			errorPlacement: function (error, element) {
				error.addClass("error-block");
				if (element.prop("type") === "checkbox") {
					error.insertAfter(element.parent("label"));
				} else if (element.parent('.input-group').length) {
					error.insertAfter(element.parent()); /* radio checkbox? */
				} else if (element.hasClass('select2')) {
					error.insertAfter(element.next('span')); /* select2 */
				} else {
					error.insertAfter(element);
				}
			},
			highlight: function (element, errorClass, validClass) {
				$(element).parents('.form-group').addClass('has-error').removeClass('has-success');
			},
			unhighlight: function (element, errorClass, validClass) {
				$(element).parents('.form-group').addClass('has-success').removeClass('has-error');
			}
		});
	});

	/* Delete button */
	$('body').on('click', '.btn-delete', function (e) {
		e.preventDefault();
		var deleteLink = $(this).attr('data-href');
		var id = $(this).attr('data-id');
		var name = $(this).attr('data-name');
		var callback = function () {
			setTimeout(function () {

				axios.delete(deleteLink, {
					headers: {'api-key': gApiKey}
				}).then(function (response) {
					showBox('ลบข้อมูลสำเร็จ', 'success');
					table.ajax.reload();
					
				})
				.catch(function (error) {
					showBox(error.response.data.message, 'error');
				});
			}, 100);
		}

		confirmBox('ลบข้อมูล ' + name, callback);
	});
});
