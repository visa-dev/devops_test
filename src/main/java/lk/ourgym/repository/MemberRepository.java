package lk.ourgym.repository;

import lk.ourgym.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {

    List<Member> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT m FROM Member m WHERE m.deleteddatetime IS NULL AND m.status = true")
    List<Member> findAllActiveMembers();
    
    @Query("SELECT COUNT(m) FROM Member m WHERE m.deleteddatetime IS NULL AND m.status = true")
    Long countActiveMembers();
}