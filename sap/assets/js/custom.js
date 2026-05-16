/* active menu */
var url = window.location;
var suburl = url.href.replace(/\/(creat(\S+)|edit(\S+))/g,'');    

/* for sidebar menu entirely but not cover treeview */
$('li.submenu a').filter(function () {
    return this.href == suburl;
}).addClass('active subdrop');

/* ajax modal */
$('#ajaxModal, #ajaxLargeModal').on('show.bs.modal', function (e) {
    var link = $(e.relatedTarget);
    $(this).find('.modal-content').load(link.attr('href'));
});

$('#ajaxModal, #ajaxLargeModal').on('hidden.bs.modal', function () {
    console.log('close ajax Modal');
    gModal = false;
    $('.modal-content').empty();
    $(this).removeData('bs.modal');
});

var toastText = function (msg, iconType) {
    $.toast({
        text: msg,
        showHideTransition: 'slide',
        allowToastClose: false,
        position: 'top-center',
        icon: iconType,
        hideAfter: 1500,
    });
}

var confirmBox = function (text, callback = '') {
    swal({
        title: 'ยืนยันการทำรายการ?',
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        allowOutsideClick: false
    }).then(function (result) {
        if (result.value) {
            callback();
        }        
    }).catch(swal.noop);
};

var showBox= function(title, type, text=''){
    swal({
        position: 'top-right',
        type: type,
        title: title,
        html: text,
        showConfirmButton: false,
        timer: 1500
      })
}

/* valid alpha */
jQuery.validator.addMethod('alphanumeric', function(value, element) {
    return this.optional(element) || /^[\w.]+$/i.test(value);
}, 'ระบุเฉพาะตัวอักษร a-z, 0-9 และ _ เท่านั้น');

/* global date-picker */
var datepickerOption = {
    locale:{
        format: 'DD/MM/YYYY'
    },
    autoUpdateInput: false,
    singleDatePicker: true,
};

// edit profile
$('#ajaxModal').on('shown.bs.modal', function (e) {
    var content = $('.edit-profile');
    if(content.length === 0){        
        return;
    }

    content.find('#modalForm').validate({
        submitHandler: function (form) {
            axios.post(gUrl + 'api/users', app.item, {headers:{'api-key': gApiKey}})
            .then(function (response) {
                if(response.status === 200){
                    showBox('บันทึกข้อมูลสำเร็จ', 'success');
                } else {
                    showBox('Status not 200', 'error');
                }
            })
            .catch(function (error) {
                console.log(error);
                showBox('เกิดข้อผิดพลาด', 'error');
            });

            $('#ajaxModal').modal('hide');

            return false;
        },
        rules: {
            username: {
                required: true,
                alphanumeric: true,
                minlength: 6,
                maxlength: 16,
                remote: {
                    url: gUrl + 'user/username_check',
                    type: 'post',
                    data: {
                        name: function () {
                            return app.item.name;
                        },
                        id: app.item.id
                    }
                }
            },
            password: {
                required: function(){
                    return ($('input[name=id]').val() == '0') ? true : false
                },
                alphanumeric: true,
                minlength: 6,
                maxlength: 16
            },
            confpassword: {
                equalTo: '#password'
            },
            usertype:{
                required: true
            },
            fullname:{
                required: true
            }
        },
        messages: {
            username: {
                remote: 'ชื่อผู้ใช้ {0} มีใช้ไปแล้ว!',
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