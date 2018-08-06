# passGenerator
генератор проходов для perco-web
npm i
npm start

для очистки базы можно использовать процедуру :
delimiter \\;
create procedure deleteDep() 
begin 
delete from user where id != 1; 
delete from user_staff where user_id != 1; 
delete from user_card where user_id != 1; 
delete from division where id != 1; 
delete from plc; 
delete from event_plc; 
delete from access_zone where id != 1; 
end \\
